/**
 * @file Домашка по FP ч. 2
 *
 * Подсказки:
 * Метод get у инстанса Api – каррированый
 * GET / https://animals.tech/{id}
 *
 * GET / https://api.tech/numbers/base
 * params:
 * – number [Int] – число
 * – from [Int] – из какой системы счисления
 * – to [Int] – в какую систему счисления
 *
 * Иногда промисы от API будут приходить в состояние rejected, (прямо как и API в реальной жизни)
 * Ответ будет приходить в поле {result}
 */
import Api from '../tools/api';
import {
    curry,
    __,
    compose,
    tap,
    applyTo,
    length,
    allPass,
    lt,
    gt,
    test,
    ifElse,
    not,
    ap,
    modify, andThen, modulo, partialRight, otherwise, endsWith, toLower,
} from 'ramda';

const api = new Api();

const isPromise = (val) => val && typeof val.then === 'function';

const getProp = curry((obj, prop) => obj[prop]);
const getValue = getProp(__, 'value');
const getWriteLog = getProp(__, 'writeLog');
const getHandleSuccess = getProp(__, 'handleSuccess');
const getHandleError = getProp(__, 'handleError');

const forValueProp = modify('value')
const forValuePropAsync = func => modify('value', andThen(func));

const applyToMaybePromise = ([a, b]) =>
    isPromise(a)
        ? applyTo(a, andThen(b))
        : applyTo(a, b)

const handleValue = handler => compose(
    applyToMaybePromise,
    ap([getValue, handler]),
    a => [a],
);
const tappedHandleValue = handler => tap(handleValue(handler));
const tappedWriteValueLog = tappedHandleValue(getWriteLog);
const tappedHandleValueSuccess = tappedHandleValue(getHandleSuccess);
const tappedHandleValueError = tappedHandleValue(
    ifElse(
        compose(
            andThen(endsWith('error')),
            andThen(toLower),
            andThen(String),
            handleValue(a=>a)
        ),
        ()=>{},
        getHandleError,
    )
);

const getDataApiDecToBin = a => ({from: 10, to: 2, number: String(a)});
const actionApiDecToBin = compose(
    tappedHandleValueError,
    forValuePropAsync(a => a.result),
    forValueProp(otherwise(a=>({result: a}))),
    forValueProp(api.get('https://api.tech/numbers/base')),
    forValueProp(getDataApiDecToBin),
);

const getAnimalsApiUrl = num => 'https://animals.tech/'+num;
const actionApiGetAnimal = compose(
    tappedHandleValueError,
    forValuePropAsync(a => a.result),
    forValueProp(otherwise(a=>({result: a}))),
    forValuePropAsync(api.get(__, {})),
    forValuePropAsync(getAnimalsApiUrl),
);

const validate = allPass([
    test(/^[0-9]*\.?[0-9]+$/g),
    compose(gt(__, 2), length),
    compose(lt(__, 10), length)
]);
const tappedValidate = tap(
    ifElse(
        compose(not, validate, getValue),
        compose(a=>a('ValidationError'), getHandleError),
        // compose('ValidationError', apply, getHandleError), // THROWS "g.call is not a function"
        ()=>{},
    )
)

const pow2 = partialRight(Math.pow, [2]);
const modulo3 = modulo(__, 3);
const processSequence = compose(
    tappedHandleValueSuccess,
    actionApiGetAnimal,

    tappedWriteValueLog,
    forValuePropAsync(modulo3),

    tappedWriteValueLog,
    forValuePropAsync(pow2),

    tappedWriteValueLog,
    forValuePropAsync(length),

    tappedWriteValueLog,
    actionApiDecToBin,

    tappedWriteValueLog,
    forValueProp(Math.round),
    forValueProp(parseFloat),
    tappedValidate,
    tappedWriteValueLog,
);

export default processSequence;
