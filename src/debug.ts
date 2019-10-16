import { NrStringRender } from "./nr-string-render";


((() => {

    let template = `
{{Pr=groupBy(dataSource1,['dtdoc', 'detail.name'])}}

{{Pr.loop.sort('value|desc')}}
    dtdoc = {{Pr.value|date}}
    {{items.loop}}
        detail = {{items.value}}
        {{items.loop}}
            name = {{items.name}}; detail = {{items.detail.name}}; value = {{items.detail.value}}
        {{items.endloop}}
        sum = {{count(items.detail.value)}}
    {{items.endloop}}
    sum = {{count(items.items.detail.value)}}
{{Pr.endloop}}
sum = {{count(Pr.items.items.detail.value)}}
`;

    let template2 = `
dataSource1:
{{dataSource1.loop.sort('dtdoc|desc')}}
    dtdoc = {{dataSource1.dtdoc|date}}
    name = {{dataSource1.name}}
{{dataSource1.endloop}}

dataSource2:
{{dataSource2.loop.sort('numpos|desc')}}
    numpos = {{dataSource2.numpos}}
    name = {{dataSource2.name}}
{{dataSource2.endloop}}

dataSource1:
{{dataSource1.loop.sort('dtdoc|desc')}}
    name = {{dataSource1.name}}
    dtdoc = {{dataSource1.dtdoc|date}}
{{dataSource1.endloop}}
`;
    /*
{{sum(Pr.items.value)}}
{{count(Pr.items.value)}}
{{min(Pr.items.value)}}
{{max(Pr.items.value)}}
    * */
    let dataSourceData1 = [
        {
            'dtdoc': '2018-05-18T05:00:02.000Z',
            'name': 'q1',
            'detail': {
                'name': 'qwe1',
                'value': 2,
            }
        },
        {
            'dtdoc': '2018-05-18T05:00:02.000Z',
            'name': 'q2',
            'detail': {
                'name': 'qwe2',
                'value': 2,
            }
        }
    ];
    let dataSourceData2 = [
        {
            'numpos': 1,
            'name': 'q1',
        },
        {
            'numpos': 2,
            'name': 'q2',
        },
    ];
    let render = new NrStringRender();
    let result = render.renderReport(template, [{
        name: 'dataSource1',
        data: dataSourceData1,
        param: {}
    }, {
        name: 'dataSource2',
        data: dataSourceData2,
        param: {}
    }]);
    result = render.renderReport(template2, [{
        name: 'dataSource1',
        data: dataSourceData1,
        param: {}
    }, {
        name: 'dataSource2',
        data: dataSourceData2,
        param: {}
    }]);

    console.log(result);

})());
