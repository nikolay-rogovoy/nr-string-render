/***/
import {IGroupByCondition} from "./i-group-by-condition";

export interface IGroupByObject {
    /***/
    name: string;
    /***/
    groupByCondition: IGroupByCondition;
    /***/
    fullCondition: string;
}
