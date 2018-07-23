import {NrStringRender} from "./nr-string-render";


((() => {

    let template = `
{{Рг=groupBy(dataSource1,['dtdoc', 'detail.name'])}}

{{Рг.loop}}
	dtdoc = {{Рг.value|date}}
    {{items.loop}}
        detail = {{items.value}}
        {{items.loop}}        
            name = {{items.name}}; detail = {{items.detail.name}}
        {{items.endloop}}
    {{items.endloop}}
{{Рг.endloop}}

`;
    let dataSourceData = [
        {
            'dtdoc': '2018-05-18T05:00:00.000Z',
            'name': 'q1',
            'detail': {
                'name': 'qwe1'
            }
        },
        {
            'dtdoc': '2018-05-18T05:00:00.000Z',
            'name': 'q2',
            'detail': {
                'name': 'qwe2'
            }
        },
        {
            'dtdoc': '2018-05-18T05:00:01.000Z',
            'name': 'q3',
            'detail': {
                'name': 'qwe3'
            }
        },
        {
            'dtdoc': '2018-05-18T05:00:01.000Z',
            'name': 'q3',
            'detail': {
                'name': 'qwe4'
            }
        }
    ];
    let render = new NrStringRender();
    let result = render.renderReport(template, [{
        name: 'dataSource1',
        data: dataSourceData,
        param: {}
    }]);
    console.log(result);
    // assert.deepEqual(transformResult,  etalonData, 'not equal etalon object');

})());
