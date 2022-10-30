import json from '$lib/dice.js';

export type Random = {
	types: DeckType[];

	order: number;
	ratio: number;
	label: string;
	back?: string;

	name?: string;
	hebrew?: string;
	symbol?: string;

	year?: number;
	number?: number;

	rank?: typeof RANKS[number];
	suite?: typeof SUITES[number];
	roman?: typeof ROMANS[number];
};

export type SUITES = typeof SUITES[number];
export type RANKS = typeof RANKS[number];
export type ROMANS = typeof ROMANS[number];

export const RANDOM_TYPES = [
	'eto',
	'eto10',
	'eto12',
	'trump',
	'tarot',
	'zodiac',
	'planet',
	'chess',
	'coin',
	'weather'
] as const;
export const SUITES = ['', '♢', '♡', '♣', '♠'] as const;
export const RANKS = [
	'',
	'A',
	'2',
	'3',
	'4',
	'5',
	'6',
	'7',
	'8',
	'9',
	'10',
	'J',
	'Q',
	'K'
] as const;
export const ROMANS = [
	'I',
	'II',
	'III',
	'IV',
	'V',
	'VI',
	'VII',
	'VIII',
	'IX',
	'X',
	'XI',
	'XII',
	'XIII',
	'XIV',
	'XV',
	'XVI',
	'XVII',
	'XVIII',
	'XIX',
	'XX',
	'XXI'
] as const;

type DeckJsonType = keyof typeof json;
type DeckType = DeckJsonType | 'IAU' | 'trump' | 'eto';

function Deck(type: DeckType) {
	const faces: Random[] = [];
	let ratio = 0;
	const ret = {
		faces,
		add(item: Random) {
			faces.push(item);
			ratio += item.ratio;
		},
		choice() {
			let at = Math.random() * ratio;
			for (const o of faces) {
				at -= o.ratio;
				if (at < 0) {
					const choice = full_label(o);
					return { choice, ...o };
				}
			}
		}
	};
	Dice[type] = ret;
	return ret;
}

function full_label(o: Random, side = Math.floor(Math.random() * 2)) {
	switch (o.types[1] || o.types[0]) {
		case 'tarot':
			return `${['正', '逆'][side]} ${o.roman}.${o.label}`;
		case 'zodiac':
			return `${o.symbol} ${o.roman}.${o.label}`;
		case 'planet':
		case 'weather':
		case 'shogi':
			return `${[o.name, o.back ?? o.name][side]} ${o.label}`;
		case 'chess':
			return `${o.symbol} ${o.label}`;
		default:
			return `${o.label}`;
	}
}

function add(item: Random) {
	item.types.forEach((type) => {
		Dice[type].add(item);
	});
}

export const Dice: { [key in DeckType]: ReturnType<typeof Deck> } = {} as any;

const types: DeckJsonType[] = Object.keys(json) as any;
Deck('IAU');

for (const type of types) {
	Deck(type);
	const o: any = json[type];
	let order = 0;
	for (const key in o) {
		const oo = o[key];
		order++;
		oo.order = order;
		oo.name ??= key;
		oo.label ??= key;
		oo.ratio ??= 1;
		oo.types ??= [];
		if (!oo.types.includes(type)) oo.types.push(type);

		if (['zodiac', 'tarot'].includes(type)) oo.roman = ROMANS[order];
		add(oo);
	}
}

(function () {
	Deck('eto');
	const ratio = 1;
	const types: DeckType[] = ['eto'];
	for (let idx = 0; idx < 60; ++idx) {
		const eto10 = '甲乙丙丁戊己庚辛壬癸'[idx % 10];
		const eto12 = '子丑寅卯辰巳午未申酉戌亥'[idx % 12];
		const a = json.eto10[eto10 as keyof typeof json.eto10];
		const b = json.eto12[eto12 as keyof typeof json.eto12];
		const name = `${a.name.replace(/と$/, 'との')}${b.name}`;
		const year = idx + 1984;
		const order = idx + 1;
		const label = `${eto10}${eto12}`;
		add({ order, types, ratio, label, name, year });
	}
})();

(function () {
	Deck('trump');
	const ratio = 1;
	const types: DeckType[] = ['trump'];
	const suites = SUITES.slice(1);
	const ranks = RANKS;
	suites.forEach((suite, idx1) => {
		ranks.forEach((rank, idx2) => {
			const label = `${suite}${rank}`;
			const suite_code = idx1 + 1;
			const number = idx2 + 1;
			const order = 100 * suite_code + number;
			add({ order, types, ratio, number, suite, rank, label });
		});
	});

	add({
		order: 501,
		types: ['trump'],
		ratio: 1,
		number: 0,
		suite: '',
		rank: '',
		label: 'JOKER'
	});
	add({
		order: 502,
		types: ['trump'],
		ratio: 1,
		number: 0,
		suite: '',
		rank: '',
		label: 'joker'
	});
})();
