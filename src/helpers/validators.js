import {allPass, compose, curry, sum, gte, tap, map, equals, any, applyTo, dropLast, not, uniq, length} from 'ramda';
import {COLORS, SHAPES} from '../constants.js';
import { __ } from 'ramda';

/**
 * @file Домашка по FP ч. 1
 *
 * Основная задача — написать самому, или найти в FP библиотеках функции anyPass/allPass
 * Эти функции/их аналоги есть и в ramda и в lodash
 *
 * allPass — принимает массив функций-предикатов, и возвращает функцию-предикат, которая
 * вернет true для заданного списка аргументов, если каждый из предоставленных предикатов
 * удовлетворяет этим аргументам (возвращает true)
 *
 * anyPass — то же самое, только удовлетворять значению может единственная функция-предикат из массива.
 *
 * Если какие либо функции написаны руками (без использования библиотек) это не является ошибкой
 */


const isExactColor = curry((input, needed) => input === needed);
const isRed = isExactColor(__, COLORS.RED);
const isBlue = isExactColor(__, COLORS.BLUE);
const isOrange = isExactColor(__, COLORS.ORANGE);
const isGreen = isExactColor(__, COLORS.GREEN);
const isWhite = isExactColor(__, COLORS.WHITE);

const getFigure = curry((figures, name) => figures[name]);
const getTriangle = getFigure(__, SHAPES.TRIANGLE);
const getSquare = getFigure(__, SHAPES.SQUARE);
const getCircle = getFigure(__, SHAPES.CIRCLE);
const getStar = getFigure(__, SHAPES.STAR);
const gettersList = [getTriangle, getSquare, getCircle, getStar];


const countInObj = curry((data, getters, check) => sum(map((getter) => check(getter(data)), getters)));
const countFigures = countInObj(__, gettersList);
const countRed = countFigures(__, isRed);
const countBlue = countFigures(__, isBlue);
const countOrange = countFigures(__, isOrange);
const countGreen = countFigures(__, isGreen);
const countWhite = countFigures(__, isWhite);
const countersList = [countRed, countBlue, countOrange, countGreen, countWhite];
const coloredCountersList = dropLast(1, countersList);

// 1. Красная звезда, зеленый квадрат, все остальные белые.
export const validateFieldN1 = allPass([
    compose(isWhite, getCircle),
    compose(isGreen, getSquare),
    compose(isWhite, getTriangle),
    compose(isRed, getStar),
]);

// 2. Как минимум две фигуры зеленые.
const gte2 = curry(gte)(__, 2);
export const validateFieldN2 = compose(
    gte2,
    countGreen,
);

// 3. Количество красных фигур равно кол-ву синих.
export const validateFieldN3 = figures => equals(countRed(figures), countBlue(figures));

// 4. Синий круг, красная звезда, оранжевый квадрат треугольник любого цвета
export const validateFieldN4 = allPass([
    compose(isBlue, getCircle),
    compose(isOrange, getSquare),
    // trinagle
    compose(isRed, getStar)
])

// 5. Три фигуры одного любого цвета кроме белого (четыре фигуры одного цвета – это тоже true).
const gte3 = gte(__, 3);
export const validateFieldN5 = compose(
    any(gte3),
    map(__, coloredCountersList),
    applyTo,
)

// 6. Ровно две зеленые фигуры (одна из зелёных – это треугольник), плюс одна красная. Четвёртая оставшаяся любого доступного цвета, но не нарушающая первые два условия
export const validateFieldN6 = allPass([
    compose(isGreen, getTriangle),
    compose(equals(2), countGreen),
    compose(equals(1), countRed)
])

// 7. Все фигуры оранжевые.
export const validateFieldN7 = compose(
    equals(4),
    countOrange,
)

// 8. Не красная и не белая звезда, остальные – любого цвета.
export const validateFieldN8 = allPass([
    compose(not, isRed, getStar),
    compose(not, isWhite, getStar),
]);

// 9. Все фигуры зеленые.
export const validateFieldN9 = compose(
    equals(4),
    countGreen,
)

// 10. Треугольник и квадрат одного цвета (не белого), остальные – любого цвета
export const validateFieldN10 = allPass([
    compose(not, isWhite, getTriangle),
    compose(not, isWhite, getSquare),
    compose(
        equals(1),
        length,
        uniq,
        map(__, [getSquare, getTriangle]),
        applyTo,
        tap(console.log),
    ),
]);
