/***/
import {NrDataTransformer} from "nr-data-transtormer";
import {IGroupByObject} from "./i-group-by-object";
import {IGroupByCondition} from "./i-group-by-condition";
import {IDataSource} from "./i-data-source";
import {ITemplatePart} from "./i-template-part";
import {ISortField} from "./i-sort-field";
import {SortDirection} from "./sort-direction";

export class NrStringRender {

    /***/
    transformer = new NrDataTransformer(() => 'Неопределено');

    /***/
    constructor() {
    }


    /**Генерация отчета для источников данных*/
    renderReport(template: string, dataSources: IDataSource[]): string {
        // Сгруппировать
        dataSources.push(...this.getGroupByDataSources(template, dataSources));
        template = this.removeGroupByFromTemplate(template);
        for (let dataSource of dataSources) {
            template = this.renderDataSourceRec(dataSource.name, dataSource.data, template);
            template = this.replaceParam(dataSource.param, template);
        }
        return template;
    }

    /***/
    replaceParam(param: object, renderCanvas: string): string {
        for (let paramName in param) {
            if (param.hasOwnProperty(paramName)) {
                renderCanvas = this.replaceValueOnTemplate(paramName, renderCanvas, param[paramName]);
            }
        }
        return renderCanvas;
    }

    /***/
    getGroupByDataSources(template: string, dataSources: IDataSource[]): IDataSource[] {
        let grouppedDataSource: IDataSource[] = [];
        for (let groupByObject of this.getGroupByObjects(template)) {
            for (let dataSource of dataSources) {
                if (dataSource.name === groupByObject.groupByCondition.dataSourceName) {
                    let groupedDataSource = this.transformer.groupByTransformer(groupByObject.groupByCondition.groupFields, dataSource.data);
                    grouppedDataSource.push({name: groupByObject.name, data: groupedDataSource, param: {}});
                }
            }
        }
        return grouppedDataSource;
    }

    /**Генерация отчета для одного источника данных*/
    renderDataSourceRec(dataSourceName: string, dataSourceData: any[], template: string) {
        let result = template;
        for (let templatePart of this.getTemplatePart(dataSourceName, template)) {
            this.sortDataSourceData(dataSourceData, templatePart.sort);
            let renderedDataSource = this.renderDataSource(dataSourceName, dataSourceData,
                this.removeDataSourceMarker(templatePart.template, dataSourceName));
            result = result.replace(templatePart.template, renderedDataSource);
        }
        return result;
    }

    /***/
    sortDataSourceData(dataSourceData: any[], fields: ISortField[]): void {
        if (fields.length) {
            dataSourceData.sort((x, y) => {
                let compareResult = 0;
                fields.forEach((field, index) => {
                    let valueX = this.extractDataFromObject(x, field.name);
                    let valueY = this.extractDataFromObject(y, field.name);
                    if (valueX !== valueY || index === fields.length - 1) {
                        if (valueX > valueY) {
                            compareResult = 1;
                        } else if (valueX < valueY) {
                            compareResult = -1;
                        } else {
                            compareResult = 0;
                        }
                    }
                    if (field.sortDiraction === SortDirection.desc) {
                        compareResult *= -1;
                    }
                });
                return compareResult;
            });
        }
    }

    /***/
    getTemplatePart(dataSourceName: string, template: string): ITemplatePart[] {
        let result: ITemplatePart[] = [];
        // Ищем дата сурс в шаблоне
        let regExpStr = `{{${dataSourceName}\\.loop(\\.sort\\([\\w\\n'.,\\s|]+\\))?}}[\\s\\w\\W]*{{${dataSourceName}\\.endloop}}`;
        let regExp = new RegExp(regExpStr, 'gm');
        // Ищем шаблон
        let regExpResult = template.match(regExp);
        // Если в шаблоне есть итератор для сущности
        if (regExpResult != null && regExpResult.length > 0) {
            for (let templatePart of template.match(regExp)) {
                result.push(
                    {template: templatePart, sort: this.getSortFields(template)}
                );
            }
        }
        return result;
    }

    /***/
    getSortFields(template: string): ISortField[] {
        let sortFields: ISortField[] = [];
        let regExpFields = /loop\.sort\(('[\w\s\n,.'|"]+')+\)/g;
        let regExpField = /'([\w\n.]+)(\|(desc))*'[\s,]?/g;
        let sortFieldsStr;
        let sortFieldStr;
        while (sortFieldsStr = regExpFields.exec(template)) {
            while (sortFieldStr = regExpField.exec(sortFieldsStr[1])) {
                let sortDirection = SortDirection.ask;
                if (sortFieldStr.length === 4 && sortFieldStr[3] === 'desc') {
                    sortDirection = SortDirection.desc;
                }
                sortFields.push({name: sortFieldStr[1], sortDiraction: sortDirection});
            }
        }
        return sortFields;
    }

    /**Убираем из шаблона указатели на источник данных*/
    removeDataSourceMarker(templatePart: string, dataSourceName: string): string {
        let iterateItemClear = templatePart.replace(new RegExp(`^{{${dataSourceName}\\.loop(\\.sort\\([\\w\\n'.,\\s|]+\\))?}}`, 'g'), '');
        iterateItemClear = iterateItemClear.replace(new RegExp(`{{${dataSourceName}\\.endloop}}$`, 'g'), '');
        return iterateItemClear;
    }

    /**Из шаблона генерим пачку интерполированных шаблонов*/
    renderDataSource(dataSourceName: string, dataSourceData: any[], template: string) {
        let renderedTemplates = '';
        for (let obj of dataSourceData) {
            let renderRow = template;
            // Провести интерполяцию
            for (let prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    if (Array.isArray(obj[prop])) {
                        // Рекурсия дальше
                        renderRow = this.renderDataSourceRec(prop, obj[prop], renderRow);
                    } else {
                        let allProps = [prop];
                        if (obj[prop] != null && typeof obj[prop] === 'object') {
                            allProps = this.getLeafPath(obj[prop], prop);
                        }
                        for (let propItem of allProps) {
                            let valuetToReplace = this.extractDataFromObject(obj, propItem);
                            if (valuetToReplace == null) {
                                valuetToReplace = '';
                            }
                            // Регулярное выражение поиска полей интерполяции
                            let fieldName = `${dataSourceName}\\.${propItem}`;
                            renderRow = this.replaceValueOnTemplate(fieldName, renderRow, valuetToReplace);
                        }
                    }
                }
            }
            // Удалить все не интерполированные поля
            renderRow = renderRow.replace(/{{[\s\w\W]+?}}/g, '');
            renderedTemplates += renderRow;
        }
        return renderedTemplates;
    }

    /***/
    replaceValueOnTemplate(fieldName: string, template: string, valueToReplace: any): string {
        let refExpValue = new RegExp(`{{${fieldName}(\\|date)?(\\|number)?(\\|currency)?}}`, 'g');
        let dataSourceValue = template.match(refExpValue);
        if (dataSourceValue != null) {
            // Меняем в шаблоне
            for (let iterateItemValue of dataSourceValue) {
                let valuetToReplaceFormat = valueToReplace;
                if (iterateItemValue.includes('|date')) {
                    let dt = new Date(valueToReplace);
                    valuetToReplaceFormat = this.formatApp(dt);
                } else if (iterateItemValue.includes('|number')) {
                    let num = +valueToReplace;
                    let language = navigator.language;
                    valuetToReplaceFormat = num.toLocaleString(language);
                } else if (iterateItemValue.includes('|currency')) {
                    let num = +valueToReplace;
                    let language = navigator.language;
                    valuetToReplaceFormat = num.toLocaleString(language, {'minimumFractionDigits': 2});
                }
                template = template.replace(iterateItemValue, valuetToReplaceFormat);
            }
        }
        return template;
    }

    /***/
    formatApp(date: Date) {
        let mm = date.getMonth() + 1; // getMonth() is zero-based
        let dd = date.getDate();

        return [
            (dd > 9 ? '' : '0') + dd,
            (mm > 9 ? '' : '0') + mm,
            date.getFullYear()
        ].join('.');
    }

    /***/
    getGroupByObjects(template: string): IGroupByObject[] {
        let regExpGroup = /{{([\n\wа-яёА-ЯЁ]+)\s*=\s*groupBy[ ]*\(([\n\w\s.,а-яёА-ЯЁ'"[\]]+)\)}}/g;
        let result: IGroupByObject[] = [];
        let regExpResult;
        while (regExpResult = regExpGroup.exec(template)) {
            let groupByCondition = this.getGroupByCondition(regExpResult[2]);
            result.push({name: regExpResult[1], groupByCondition, fullCondition: regExpResult[0]});
        }
        return result;
    }

    /***/
    removeGroupByFromTemplate(template: string) {
        for (let groupByObject of this.getGroupByObjects(template)) {
            template = template.replace(groupByObject.fullCondition, '');
        }
        return template;
    }

    /***/
    getGroupByCondition(groupByCondition: string): IGroupByCondition {
        let regExp = /^([\n\w\sа-яёА-ЯЁ]+),\[([\n\w\s.,а-яёА-ЯЁ'"]+)\]$/g;
        let result = [];
        let regExpResult;
        while (regExpResult = regExp.exec(groupByCondition)) {
            result.push([regExpResult[1], regExpResult[2]]);
        }
        if (result.length !== 1) {
            throw new InvalidGroupObjectParams('');
        }
        return {dataSourceName: result[0][0], groupFields: this.getGroupByFields(result[0][1])};
    }

    /***/
    getGroupByFields(groupFields: string): string[] {
        let groupField = groupFields.split(',').map(x => x.trim().replace(/['"]+/g, ''));
        if (groupField.length === 0) {
            throw new InvalidGroupObjectParams('');
        }
        return groupField;
    }

    /***/
    getLeafPath(obj: Object, selfKey?: string): string[] {
        if (obj != null && typeof obj === 'object') {
            let result = [];
            for (let key in obj) {
                if (obj.hasOwnProperty(key)) {
                    result.push(...this.getLeafPath(obj[key], key)
                        .map(x => `${selfKey == null ? '' : `${selfKey}.`}${x}`));
                }
            }
            return result;
        } else {
            return [selfKey];
        }
    }

    /***/
    extractDataFromObject(obj: Object, path: string): any {
        let regExp = /^(\w*)\./gm;
        let result = regExp.exec(path);
        if (result) {
            let newPath = path.replace(regExp, '');
            if (obj.hasOwnProperty(result[1])) {
                return this.extractDataFromObject(obj[result[1]], newPath);
            } else {
                throw Error('Не найдено свойство ' + result[1]);
            }
        } else {
            if (obj.hasOwnProperty(path)) {
                return obj[path];
            } else {
                throw Error('Не найдено свойство ' + path);
            }
        }
    }
}

