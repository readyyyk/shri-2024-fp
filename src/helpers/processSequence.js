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
    modify, andThen, modulo, partialRight,
} from 'ramda';

const api = new Api();

const isPromise = (val) => val && typeof val.then === 'function';

const getProp = curry((obj, prop) => obj[prop]);
const getValue = getProp(__, 'value');
const getWriteLog = getProp(__, 'writeLog');
const getHandleSuccess = getProp(__, 'handleSuccess');
const getHandleError = getProp(__, 'handleError');

const apiDecToBin = async (dec) =>
    api.get('https://api.tech/numbers/base', {from: 10, to: 2, number: String(dec)})
        .then(a => a.result);
const apiGetAnimal = async (num) =>
    api.get('https://animals.tech/'+num, {})
        .then(a => a.result)
        .catch(e=>console.error(e));

const applyToMaybePromise = ([a, b]) =>
    isPromise(a)
        ? applyTo(a, andThen(b))
        : applyTo(a, b)

const tappedHandleValue = handler => tap(compose(
    applyToMaybePromise,
    tap(console.log),
    ap([getValue, handler]),
    a => [a],
));
const tappedWriteValueLog = tappedHandleValue(getWriteLog);
const tappedHandleValueSuccess = tappedHandleValue(getHandleSuccess);

const validate = allPass([
    compose(tap(console.log), test(/^[0-9]*\.?[0-9]+$/g)),
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
    modify('value', andThen(apiGetAnimal)),
    tappedWriteValueLog,
    modify('value', andThen(modulo3)),
    tappedWriteValueLog,
    modify('value', andThen(pow2)),
    tappedWriteValueLog,
    modify('value', andThen(length)),
    tappedWriteValueLog,
    modify('value', apiDecToBin),
    tappedWriteValueLog,
    modify('value', Math.round),
    modify('value', parseFloat),
    tappedValidate,
    tappedWriteValueLog,
);

export default processSequence;
