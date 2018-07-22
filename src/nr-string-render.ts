/***/
import {NrDataTransformer} from "nr-data-transtormer";
import {IGroupByObject} from "./i-group-by-object";
import {IGroupByCondition} from "./i-group-by-condition";
import {IDataSource} from "./i-data-source";

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
        for (let dataSource of dataSources) {
            template = this.renderReportRec(dataSource, template);
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
    getGroupByDataSources(template: string, dataSources: any[]): any[] {
        let grouppedDataSource = [];
        for (let groupByObject of this.getGroupByObjects(template)) {
            for (let dataSource of dataSources) {
                if (dataSource.dataSourceName === groupByObject.groupByCondition.dataSourceName) {
                    let groupedDataSource = this.transformer.groupByTransformer(groupByObject.groupByCondition.groupFields, dataSource);
                    grouppedDataSource.push({dataSourceName: groupByObject.name, dataSourceData: groupedDataSource});
                }
            }
        }
        return grouppedDataSource;
    }

    /**Генерация отчета для одного источника данных*/
    renderReportRec(dataSourceName: string, dataSourceData: any[], template: string) {
        let result = template;
        // Ищем дата сурс в шаблоне
        let regExpStr = `{{${dataSourceName}\\.loop}}[\\s\\w\\W]*?{{${dataSourceName}\\.endloop}}`;
        let regExp = new RegExp(regExpStr, 'gm');
        if (dataSourceData.length > 0) {
            // Есть записи, ищем шаблон
            let regExpResult = template.match(regExp);
            // Если в шаблоне есть итератор для сущности
            if (regExpResult != null && regExpResult.length > 0) {
                for (let templatePart of template.match(regExp)) {
                    let renderedData = this.renderDataSource(dataSourceName, dataSourceData, this.removeDataSourceMarker(templatePart, dataSourceName));
                    result = result.replace(new RegExp(regExpStr, 'm'), renderCanvasArr);
                }
            }// Нет шаблона
        } else {
            // Нет записей для сущности - генерить нечего
            result = template.replace(regExp, '');
        }
        return result;
    }

    /**Убираем из шаблона указатели на источник данных*/
    removeDataSourceMarker(templatePart: string, dataSourceName: string): string {
        let iterateItemClear = templatePart.replace(new RegExp(`^{{${dataSourceName}\\.loop}}`, 'gm'), '');
        iterateItemClear = iterateItemClear.replace(new RegExp(`{{${dataSourceName}\\.endloop}}$`, 'gm'), '');
        return iterateItemClear;
    }

    /**Из шаблона генерим пачку интерполированных шаблонов*/
    renderDataSource(dataSourceName: string, dataSourceData: any[], template: string) {
        let renderedTemplates = '';
        for (let obj of dataSourceData) {
            // Провести интерполяцию :)
            for (let prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    if (Array.isArray(obj[prop])) {
                        // Рекурсия дальше
                        template = this.renderReportRec(prop, obj[prop], template);
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
                            template = this.replaceValueOnTemplate(fieldName, template, valuetToReplace);
                        }
                    }
                }
            }
            // Удалить все не интерполированные поля
            template = template.replace(/{{[\s\w\W]+?}}/g, '');
            renderedTemplates += template;
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
        let regExpGroup = /{{([\wа-яёА-ЯЁ]+)\s*=\s*groupBy[ ]*\(([\w\s,а-яёА-ЯЁ'"[\]]+)\)}}/g;
        let result: IGroupByObject[] = [];
        let regExpResult;
        while (regExpResult = regExpGroup.exec(template)) {
            let groupByCondition = this.getGroupByCondition(regExpResult[2]);
            result.push({name: regExpResult[1], groupByCondition});
        }
        return result;
    }

    /***/
    getGroupByCondition(groupByCondition: string): IGroupByCondition {
        let regExp = /^([\w\sа-яёА-ЯЁ]+),\[([\w\s,а-яёА-ЯЁ'"]+)\]$/g;
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

