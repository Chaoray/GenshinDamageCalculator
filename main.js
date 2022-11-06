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
    return 1 + v('#ply-crtDmg') / 100;
}

function critExp() {
    return 1 + v('#ply-crtDmg') / 100 * v('#ply-crtRat') / 100;
}

function damageMagnification() {
    return 1 + v('#ply-eleDmgInc') / 100;
}

function resistance() {
    let rst = v('#mtr-rst') - v('#ply-drst');
    if (rst < 0) {
        rst = 1 - rst / 200;
    } else if (0 <= rst && rst <= 75) {
        rst = 1 - rst / 100;
    } else if (rst > 75) {
        rst = 1 / (1 + 4 * rst / 100);
    }
    return rst;
}

function defense() {
    // (角色等级+100) / ((1-无视防御效果)(1-防御减免效果+防御增加效果) * (怪物等级+100)+角色等级+100)
    let monsterCoef = v('#mtr-lvl') + 100;
    let playerCoef = v('#ply-lvl') + 100;
    let ignoreDef = v('#ply-igdef') / 100;

    return playerCoef / ((1 - ignoreDef) * (1 - v('#ply-ddef')) * monsterCoef + playerCoef)
}

let directDamage = 0;
let directDamageRst = 0;
let directDamageCrt = 0;
let directDamageCrtRst = 0;
function directDamageCalc() {
    directDamage = v('#ply-atk') * skill() * level() * resistance() * defense();

    $('#dmg').innerHTML = directDamage;
    $('#dmg-crt').innerHTML = directDamage * crit();
    $('#dmg-exp').innerHTML = directDamage * crit() * critExp();
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
    let rctDmgInc = v('#ply-rctDmgInc') / 100;
    let eleMtr = v('#ply-eleMtr');

    $('#cst').innerHTML = NaN;
    switch (reactionSelect.options[reactionSelect.selectedIndex].className) {
        case 'physical': {
            reactionDamage = directDamage * damageMagnification();
            reactionDamageCrt = reactionDamage * crit();
            reactionExpectedDamage = reactionDamage * critExp();
            break;
        }

        case 'amplifying': {
            // 伤害=总攻击力*伤害倍率*(1+伤害加成)*(1+暴击伤害)*反应总倍率*防御减免*抗性减免
            let A = 2.78;
            let B = 1400;
            reactionDamage = directDamage * damageMagnification() * reactionValue * (1 + A / (1 + B / v('#ply-eleMtr')) + v('#ply-rctDmgInc'));
            reactionDamageCrt = reactionDamage * crit();
            reactionExpectedDamage = reactionDamage * critExp();
            break;
        }

        case 'quicken': {
            // 伤害=(总攻击力*伤害倍率+激化反应加成值)*(1+伤害加成)*(1+暴击伤害)*防御减免*抗性减免
            reactionDamage =
                v('#ply-atk') * skill() +
                transformativeCoefficient[lvl - 1] * reactionValue * (1 + (5 * eleMtr) / (eleMtr + 1200) + rctDmgInc);
            reactionDamage = reactionDamage * damageMagnification() * resistance() * defense();
            reactionDamageCrt = reactionDamage * crit();
            reactionExpectedDamage = reactionDamage * critExp();
            break;
        }

        case 'transformative':
        case 'bloom': {
            // 剧变伤害=等级系数×抗性承伤×反应基础倍率×(1+精通提升+反应伤害提升)
            reactionDamage =
                transformativeCoefficient[lvl - 1] * reactionValue * (1 + (16 * eleMtr / (eleMtr + 2000)) + rctDmgInc)
                * resistance();
            reactionDamageCrt = NaN;
            reactionExpectedDamage = NaN;
            break;
        }

        case 'crystallize': {
            // 结晶等级系数*(1+(4.44*元素精通)/(元素精通+1400))
            let shield = crystalShieldCoefficient[lvl - 1] * (1 + (reactionValue * eleMtr / (eleMtr + 1400)));
            $('#cst').innerHTML = shield;
            break;
        }
    }

    $('#dmg-rct').innerHTML = reactionDamage;
    $('#dmg-rct-crt').innerHTML = reactionDamageCrt;
    $('#dmg-rct-exp').innerHTML = reactionExpectedDamage;
}

function calculate() {
    directDamageCalc();
    reactionDamageCalc();
    $('#level').innerHTML = level();
    $('#resist').innerHTML = (1 - resistance()) * 100 + '%';
    $('#def').innerHTML = (1 - defense()) * 100 + '%';
}

calculate();