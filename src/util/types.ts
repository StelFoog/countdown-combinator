export type Expression = '+' | '-' | '*' | '/';

export type Value = { value: number; way: string; used: number[]; lastExpr?: Expression };

export type CountdownClosestResult = { results: Value[]; timeTaken: number; target: number };
