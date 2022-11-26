<script lang="ts">
	import { Dice } from '$lib';
	console.log(Dice);

	let sample = Dice.tarot.toDeck('tarot-sample');
</script>

<h1>Welcome to your library project</h1>
<p>Create your package using @sveltejs/package and preview/showcase your work with SvelteKit</p>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
<p>coin : {Dice.coin.choice().choice}</p>
<p>D2 : {Dice.dice(2).choice().choice}</p>
<p>D4 : {Dice.dice(4).choice().choice}</p>
<p>D6 : {Dice.dice(6).choice().choice}</p>
<p>D10 : {Dice.dice(10).choice().choice}</p>
<p>D12 : {Dice.dice(12).choice().choice}</p>
<p>D20 : {Dice.dice(20).choice().choice}</p>
<p>D100 : {Dice.dice(100).choice().choice}</p>
<p>shogi : {Dice.shogi.choice().choice}</p>
<p>chess : {Dice.chess.choice().choice}</p>
<p>zodiac : {Dice.zodiac.choice().choice}</p>
<p>IAU : {Dice.IAU.choice().choice}</p>
<p>eto : {Dice.eto.choice().choice}</p>
<p>tarot : {Dice.tarot.choice().choice}</p>
<p>trump : {Dice.trump.choice().choice}</p>
<p>weather : {Dice.weather.choice().choice}</p>
<hr />
{#each sample.faces as tarot}
	<p>
		{tarot.roman}.{tarot.label} <code>hebrew: "{tarot.hebrew}"</code><code
			>name: "{tarot.name}"</code
		><code>order: {tarot.order}</code>
	</p>
{/each}
