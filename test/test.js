const assert = require('assert');
const stringRender = require('../dist/index.js');

describe('test stringRender', function(){
    it('test render', function(){
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

/**
 {{count(Pr.items.value)}}
 {{min(Pr.items.value)}}
 {{max(Pr.items.value)}}
 */
        let dataSourceData = [
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
            },
            {
                'dtdoc': '2018-05-18T05:00:01.000Z',
                'name': 'q3',
                'detail': {
                    'name': 'qwe3',
                    'value': 2,
                }
            },
            {
                'dtdoc': '2018-05-18T05:00:01.000Z',
                'name': 'q3',
                'detail': {
                    'name': 'qwe3',
                    'value': 1,
                }
            },
            {
                'dtdoc': '2018-05-18T05:00:01.000Z',
                'name': 'q3',
                'detail': {
                    'name': 'qwe4',
                    'value': 2,
                }
            }
        ];
        let render = new stringRender.NrStringRender();
        let result = render.renderReport(template, [{
            name: 'dataSource1',
            data: dataSourceData,
            param: {}
        }]);
        console.log(result);
        // assert.deepEqual(transformResult,  etalonData, 'not equal etalon object');
    });
});
