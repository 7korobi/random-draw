import json from '$lib/dice.js';

type Base = {
	types: DeckType[];

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
	order: number;
};

type DeckItem = Base & {
	deck_id: string
	choice?: string
}

type RandomFace = Base & {
	ratio: number
}

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
	'',
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
type DeckType = DeckJsonType | 'IAU' | 'trump' | 'eto' | 'dice';

function Deck(deck_id: string) {
	const faces: DeckItem[] = [];
	const ret = {
		faces,

		add(item: DeckItem) {
			delete (item as any).ratio
			faces.push(item);
			item.deck_id = deck_id
		},

		choice() {
			let at = Math.floor(Math.random() * faces.length);
			const o = faces[at]
			o.choice = full_label(o);

			return o;
		}
	};
	return ret;
}

function DICE(ratio: number) {
	const types: DeckType[] = ['dice']
	const ret = {
		deckTo(deck_id: string) {

		},

		choice() {
			const number = 1 + Math.floor(Math.random() * ratio);
			const order = number
			const label = `${number}`
			const choice = full_label({ types, label, number, order })

			return { choice, number, order }
		}
	}
	return ret;
}

function Random(type: DeckType) {
	const faces: RandomFace[] = [];
	let ratio = 0;
	const ret = {
		faces,

		add(item: RandomFace) {
			faces.push(item);
			ratio += item.ratio;
		},

		deckTo(deck_id: string) {			
			const dst = Deck(deck_id)
			for (const o of faces){
				let idx = o.ratio;
				while(0 < idx--) {
					dst.add({...o, deck_id})
				}
			}
			return dst
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
	return ret;
}

function full_label(o: Base, side = Math.floor(Math.random() * 2)) {
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

function add(item: RandomFace) {
	item.types.forEach((type) => {
		Dice[type].add(item);
	});
}

export const Dice: { [key in DeckType]: ReturnType<typeof Random>} & { dice: typeof DICE } = {
	IAU: Random('IAU'),
	dice: DICE
} as any;
const types: DeckJsonType[] = Object.keys(json) as any;

for (const type of types) {
	Dice[type] = Random(type);
	const o: any = json[type];
	let order = 1;

	for (const key in o) {
		const oo = o[key];
		oo.name ??= key;
		oo.label ??= key;
		oo.ratio ??= 1;
		oo.types ??= [];
		oo.order ??= order
		if (!oo.types.includes(type)) oo.types.push(type);

		if ('tarot' === type) {
			oo.roman = ROMANS[order - 1]
		} else {
			oo.roman = ROMANS[order]
		}
		add(oo);
		order++;
	}
}

(function () {
	Dice.eto = Random('eto');
	const ratio = 1;
	const types: DeckType[] = ['eto'];

	const now_year = new Date().getFullYear()
	const eto10_start_year = now_year - (now_year - 1984) % 10
	const eto12_start_year = now_year - (now_year - 1984) % 12

	for (let idx = 0; idx < 60; ++idx) {
		const eto10 = '甲乙丙丁戊己庚辛壬癸'[idx % 10];
		const eto12 = '子丑寅卯辰巳午未申酉戌亥'[idx % 12];
		const a = json.eto10[eto10 as keyof typeof json.eto10] as RandomFace;
		const b = json.eto12[eto12 as keyof typeof json.eto12] as RandomFace;
		const name = `${a.name!.replace(/と$/, 'との')}${b.name!}`;
		const label = `${eto10}${eto12}`;
		const year = idx + 1984;
		const order = idx + 1;
		if (eto10_start_year <= year && year < eto10_start_year + 10) a.year = year
		if (eto12_start_year <= year && year < eto12_start_year + 12) b.year = year
		add({ year, types, ratio, label, name, order });
	}
})();

(function () {
	Dice.trump = Random('trump');
	const ratio = 1;
	const types: DeckType[] = ['trump'];
	const suites = SUITES.slice(1);
	const ranks = RANKS.slice(1);
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
