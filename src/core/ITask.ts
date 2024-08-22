export interface ITaskArgs<TR = any> {
    then?: (x: TR) => any;
    failed?: (x) => any;
    throwOnFail?: boolean;
};

export interface IThenTaskArgs<TR = any> {
    then: (x: TR) => any;
    failed?: (x) => any;
    throwOnFail?: boolean;
};

export type TaskArgs<T, TR = any> = T & ITaskArgs<TR>;

export type ThenTaskArgs<T, TR = any> = T & IThenTaskArgs<TR>;
