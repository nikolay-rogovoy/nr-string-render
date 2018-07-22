const assert = require('assert');
const stringRender = require('../dist/index.js');

describe('#indexOf()', function(){
    it('test groupByTransformer', function(){
        let pattern = `
<p><strong>Эффективность рекламных источников</strong>
	<br>за период с {{@dtstart|date}} по {{@dtend|date}}</p>
<p>Распечатал: {{@customer_name}}</p>

<table>
	<tbody>
		<tr>
			<td>Источник</td>
			<td><strong>Офис</strong></td>
			<td>Количество обращений</td>
			<td>Количество замеров</td>
			<td>Количество договоров</td>
			<td>Сумма договоров</td>
			<td>Сумма платежей за рекламу по источнику</td>
			<td>Эффективность источника, руб</td>
		</tr>

{{Рг=groupBy(Рекламные источники,['dtdoc', 'appealsource_name'])}}
{{Рг.loop}}
	{{Pr.value|date}}
	{{appealsource_name.loop}}
		{{appealsource_name.value}}
		<tr>
			<td>{{appealsource_name.appealsource_name}}
				<br>
			</td>
			<td>{{Рекламные источники.customerdepartment.name}}
				<br>
			</td>
			<td>{{Рекламные источники.appeal_count}}
				<br>
			</td>
			<td>{{Рекламные источники.sizedoc_count}}
				<br>
			</td>
			<td>{{Рекламные источники.qu_agreement}}
				<br>
			</td>
			<td>{{Рекламные источники.agreement_smdocwithdiscount}}
				<br>
			</td>
			<td>
				<br>
			</td>
			<td>
				<br>
			</td>
		</tr>
	{{appealsource_name.endloop}}
{{Pr.endloop}}

		<tr>
			<td></td>
			<td></td>
			<td>{{sum(Pr.appeal_count)}}</td>
			<td>{{sum(Pr.sizedoc_count)}}</td>
			<td>{{sum(Pr.qu_agreement)}}</td>
			<td>{{sum(Pr.agreement_smdocwithdiscount)}}</td>
			<td></td>
			<td></td>
		</tr>

	</tbody>
</table>

<p>
	<br>
</p>

<table>
	<tbody>
		<tr>
			<td>Источник</td>
			<td><strong>Сотрудник</strong></td>
			<td>Количество обращений</td>
			<td>Количество замеров</td>
			<td>Количество договоров</td>
			<td>Сумма договоров</td>
			<td>Сумма платежей за рекламу по источнику</td>
			<td>Эффективность источника, руб</td>
		</tr>
		<tr>
			<td>{a}
				<br>
			</td>
			<td>{a}
				<br>
			</td>
			<td>{a}
				<br>
			</td>
			<td>{a}
				<br>
			</td>
			<td>{a}
				<br>
			</td>
			<td>{a}
				<br>
			</td>
			<td>{a}
				<br>
			</td>
			<td>{a}</td>
		</tr>
	</tbody>
</table>

`;
        let dataSourceData = [
            {
                "dtdoc": "2018-05-18T05:44:27.000Z",
                "appeal_count": 1,
                "sizedoc_count": 0,
                "orderdoc_count": 0,
                "qu_agreement": 0,
                "agreement_smdocwithdiscount": 0,
                "customerdepartment": null,
                "appealsource": {
                    "name": "Интернет Входящий звонок "
                }
            },
            {
                "dtdoc": "2018-06-16T13:45:44.000Z",
                "appeal_count": 1,
                "sizedoc_count": 0,
                "orderdoc_count": 0,
                "qu_agreement": 0,
                "agreement_smdocwithdiscount": 0,
                "customerdepartment": {
                    "name": "Офис № 2 (ГСО)"
                },
                "appealsource": {
                    "name": "Основной номер"
                }
            },
            {
                "dtdoc": "2018-06-27T13:49:26.811Z",
                "appeal_count": 1,
                "sizedoc_count": 1,
                "orderdoc_count": 1,
                "qu_agreement": 1,
                "agreement_smdocwithdiscount": 167263,
                "customerdepartment": {
                    "name": "Офис № 1 (Краснодар)"
                },
                "appealsource": {
                    "name": "Реклама в газете \"Из рук в руки\""
                }
            },
            {
                "dtdoc": "2018-05-23T02:48:22.000Z",
                "appeal_count": 1,
                "sizedoc_count": 0,
                "orderdoc_count": 0,
                "qu_agreement": 0,
                "agreement_smdocwithdiscount": 0,
                "customerdepartment": null,
                "appealsource": {
                    "name": "Сайт основной: Перезвоните мне"
                }
            },
            {
                "dtdoc": "2018-06-08T09:36:00.000Z",
                "appeal_count": 1,
                "sizedoc_count": 0,
                "orderdoc_count": 0,
                "qu_agreement": 0,
                "agreement_smdocwithdiscount": 0,
                "customerdepartment": {
                    "name": "Офис № 2 (ГСО)"
                },
                "appealsource": {
                    "name": "Интернет Входящий звонок "
                }
            }
        ];
        let nrDataTransformer = new stringRender.NrStringRender(() => 'null object');
        // assert.deepEqual(transformResult,  etalonData, 'not equal etalon object');
    });
});
