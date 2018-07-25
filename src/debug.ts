import {NrStringRender} from "./nr-string-render";


((() => {

    let template = `
{{Pr=groupBy(dataSource1,['dtdoc', 'detail.name'])}}

{{Pr.loop.sort('value')}}
	dtdoc = {{Pr.value|date}}
    {{items.loop}}
        detail = {{items.value}}
        {{items.loop}}        
            name = {{items.name}}; detail = {{items.detail.name}}
        {{items.endloop}}
    {{items.endloop}}
{{Pr.endloop}}
sum = {{sum(Pr.items.items.value)}}
`;
    /*
{{sum(Pr.items.value)}}
{{count(Pr.items.value)}}
{{min(Pr.items.value)}}
{{max(Pr.items.value)}}
    * */
    let dataSourceData = [
        {
            'dtdoc': '2018-05-18T05:00:02.000Z',
            'name': 'q1',
            'detail': {
                'name': 'qwe1'
            }
        },
        {
            'dtdoc': '2018-05-18T05:00:02.000Z',
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
