const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);
const v = (selector) => parseFloat(document.querySelector(selector).value);

$$('input[type="number"]').forEach((ele) => {
    ele.addEventListener('change', (e) => {
        calculate();
    });
});

$('select').addEventListener('change', (e) => {
    calculate();
});

$('#clear').addEventListener('click', () => {
    console.log('cleared');
    $$('input[type="number"]').forEach((e) => {
        e.value = '';
    });
});

function calculate() {
    directDamageCalc();
    reactionDamageCalc();
}

function level() {
    if (v('#ply-lvl') >= 70 && v('#mtr-lvl') <= 10) {
        return 1.35;
    } else {
        return 1;
    }
}

function skill() {
    return v('#ply-skl') / 100;
}

function crit() {
    return v('#ply-crtDmg') / 100;
}

function critExp() {
    return v('#ply-crtDmg') / 100 * v('#ply-crtRat') / 100;
}

function damageMagnification() {
    return 1 + v('#ply-eleDmgInc') / 100;
}

let directDamage = 0;
let directDamageRst = 0;
let directDamageCrt = 0;
let directDamageCrtRst = 0;
function directDamageCalc() {
    directDamage = v('#ply-atk') * skill() * level();
    directDamageRst = directDamage * resistance();
    directDamageCrt = directDamage * crit();
    directDamageCrtRst = directDamageCrt * resistance();

    $('#dmg').innerHTML = directDamage;
    $('#dmg-rst').innerHTML = directDamageRst;
    $('#dmg-crt').innerHTML = directDamageCrt;
    $('#dmg-crt-rst').innerHTML = directDamageCrtRst;
    $('#dmg-exp').innerHTML = directDamageRst * critExp();
}

let reactionDamage = 0;
let reactionDamageRst = 0;
let reactionDamageCrt = 0;
let reactionDamageCrtRst = 0;
let reactionExpectedDamage = 0;
function reactionDamageCalc() {
    let reactionSelect = $('#reaction');
    let reactionValue = parseFloat(v('#reaction'));
    let lvl = v('#ply-lvl');
    let rctDmgInc = v('#ply-rctDmgInc');
    let eleMtr = v('#ply-eleMtr');

    switch (reactionSelect.options[reactionSelect.selectedIndex].className) {
        case 'amplifying': {
            let A = 2.78;
            let B = 1400;
            reactionDamage = directDamage * damageMagnification() * reactionValue * (1 + A / (1 + B / v('#ply-eleMtr')) + v('#ply-rctDmgInc'));
            reactionDamageRst = reactionDamage * resistance();
            reactionDamageCrt = reactionDamage * crit();
            reactionDamageCrtRst = reactionDamageCrt * resistance();
            reactionExpectedDamage = reactionDamageRst * critExp();
            break;
        }

        case 'transformative': {
            let C = 32000 / (eleMtr + 2000);
            reactionDamage = transformativeCoefficient[lvl - 1] * reactionValue * (17 - C) + rctDmgInc;
            reactionDamageRst = reactionDamage * resistance();
            reactionDamageCrt = NaN;
            reactionDamageCrtRst = NaN;
            reactionExpectedDamage = NaN;
            break;
        }


        case 'bloom': {
            reactionDamage = dendroCoefficient[lvl - 1] * reactionValue * (1 + (16 * eleMtr) / (eleMtr + 2000) + rctDmgInc);
            reactionDamageRst = reactionDamage * resistance();
            reactionDamageCrt = NaN;
            reactionDamageCrtRst = NaN;
            reactionExpectedDamage = NaN;
            break;
        }

        case 'quicken': {
            reactionDamage = directDamage + dendroCoefficient[lvl - 1] * reactionValue * (1 + (5 * eleMtr) / (eleMtr + 1200) + rctDmgInc);
            reactionDamageRst = reactionDamage * resistance();
            reactionDamageCrt = reactionDamage * crit();
            reactionDamageCrtRst = reactionDamageRst * crit();
            reactionExpectedDamage = reactionDamageRst * critExp();
            break;
        }
    }

    $('#dmg-rct').innerHTML = reactionDamage * level();
    $('#dmg-rct-rst').innerHTML = reactionDamageRst * level();
    $('#dmg-rct-crt').innerHTML = reactionDamageCrt * level();
    $('#dmg-rct-crt-rst').innerHTML = reactionDamageCrtRst * level();
    $('#dmg-rct-exp').innerHTML = reactionExpectedDamage * level();
}

function resistance() {
    let rst = v('#mtr-rst');
    if (rst <= 0) {
        rst = 1 - (rst / 100) / 2;
    } else if (rst > 0 && rst <= 75) {
        rst = 1 - rst / 100;
    } else if (rst > 75) {
        rst = 1 / (1 + 4 * rst / 100);
    }
    return rst;
}

calculate();