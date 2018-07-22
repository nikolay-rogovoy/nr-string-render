const assert = require('assert');
const transformer = require('../dist/index.js');

describe('#indexOf()', function(){
    it('test groupByTransformer', function(){
        let data = [
            {
                "dtdoc": "2018-05-18T05:44:27.000Z",
                "qu": 0,
                "appealsource": {
                    "name": "Интернет Входящий звонок "
                }
            },
            {
                "dtdoc": "2018-05-18T05:44:27.000Z",
                "qu": 0,
                "appealsource": {
                    "name": "Основной номер"
                }
            },
            {
                "dtdoc": "2018-05-18T05:44:27.000Z",
                "qu": 1,
                "appealsource": {
                    "name": "Основной номер"
                }
            },
            {
                "dtdoc": "2018-05-23T02:48:22.000Z",
                "qu": 0,
                "appealsource": {
                    "name": "Сайт основной: Перезвоните мне"
                }
            },
            {
                "dtdoc": "2018-05-23T02:48:22.000Z",
                "qu": 0,
                "appealsource": {
                    "name": null
                }
            }
        ];
        let etalonData = [
            {
                "value":"2018-05-18T05:44:27.000Z",
                "items":[
                    {
                        "value":"Интернет Входящий звонок ",
                        "items":[
                            {
                                "dtdoc":"2018-05-18T05:44:27.000Z",
                                "qu":0,
                                "appealsource":{
                                    "name":"Интернет Входящий звонок "
                                }
                            }
                        ]
                    },
                    {
                        "value":"Основной номер",
                        "items":[
                            {
                                "dtdoc":"2018-05-18T05:44:27.000Z",
                                "qu":0,
                                "appealsource":{
                                    "name":"Основной номер"
                                }
                            },
                            {
                                "dtdoc":"2018-05-18T05:44:27.000Z",
                                "qu":1,
                                "appealsource":{
                                    "name":"Основной номер"
                                }
                            }
                        ]
                    }
                ]
            },
            {
                "value":"2018-05-23T02:48:22.000Z",
                "items":[
                    {
                        "value":"Сайт основной: Перезвоните мне",
                        "items":[
                            {
                                "dtdoc":"2018-05-23T02:48:22.000Z",
                                "qu":0,
                                "appealsource":{
                                    "name":"Сайт основной: Перезвоните мне"
                                }
                            }
                        ]
                    },
                    {
                        "value":"null object",
                        "items":[
                            {
                                "dtdoc":"2018-05-23T02:48:22.000Z",
                                "qu":0,
                                "appealsource":{
                                    "name":null
                                }
                            }
                        ]
                    }
                ]
            }
        ];
        let nrDataTransformer = new transformer.NrDataTransformer(() => 'null object');
        let transformResult = nrDataTransformer.groupByTransformer(['dtdoc', 'appealsource.name'], data);
        assert.deepEqual(transformResult,  etalonData, 'not equal etalon object');
    });
});
