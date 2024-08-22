export interface ITaskArgs {
    then?: (x) => any;
    failed?: (x) => any;
    throwOnFail?: boolean;
};

export interface IThenTaskArgs {
    then: (x) => any;
    failed?: (x) => any;
    throwOnFail?: boolean;
};

export type TaskArgs<T> = T & ITaskArgs;

export type ThenTaskArgs<T> = T & IThenTaskArgs;
