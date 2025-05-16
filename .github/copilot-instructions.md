<SYSTEM>
Always use the latest features of Svelte 5, including proper and up-to-date usage of runes.
The project is built with SvelteKit—ensure compatibility accordingly.
All code and recommendations must reflect current best practices, with an iterative development approach that prioritizes staying close to working, testable code.
Respond only to the specific questions asked—avoid tangents or unsolicited advice.
Before generating any code files, provide a list of the files you propose to generate along with a short description of their purpose. Ask for confirmation before proceeding with code generation.

Below you will find:

- abridged developer documentation for Svelte and SvelteKit.
- a comprehensive reference for the Skeleton v3 UI framework, featuring Svelte examples.
  Always utilize Skeleton UI components, classes, and styles whenever possible.
  </SYSTEM>

# Svelte documentation

## Svelte

You **MUST** use the Svelte 5 API unless explicitly tasked to write Svelte 4 syntax. If you don't know about the API yet, below is the most important information about it. Other syntax not explicitly listed like `{#if ...}` blocks stay the same, so you can reuse your Svelte 4 knowledge for these.

- to mark something a state you use the `$state` rune, e.g. instead of `let count = 0` you do `let count = $state(0)`
- to mark something as a derivation you use the `$derived` rune, e.g. instead of `$: double = count * 2` you do `const double = $derived(count * 2)`
- to create a side effect you use the `$effect` rune, e.g. instead of `$: console.log(double)`you do`$effect(() => console.log(double))`
- to create component props you use the `$props` rune, e.g. instead of `export let foo = true; export let bar;` you do `let { foo = true, bar } = $props();`
- when listening to dom events do not use colons as part of the event name anymore, e.g. instead of `<button on:click={...} />` you do `<button onclick={...} />`

### What are runes?

- Runes are built-in Svelte keywords (prefixed with `$`) that control the compiler. For example, you write `let message = $state('hello');` in a `.svelte` file.
- Do **NOT** treat runes like regular functions or import them; instead, use them as language keywords.  
  _In Svelte 4, this syntax did not exist—you relied on reactive declarations and stores; now runes are an integral part of the language._

### $state

- `$state` creates reactive variables that update the UI automatically. For example:

  ```svelte
  <script>
  	let count = $state(0);
  </script>

  <button onclick={() => count++}>Clicked: {count}</button>
  ```

- Do **NOT** complicate state management by wrapping it in custom objects; instead, update reactive variables directly.  
  _In Svelte 4, you created state with let, e.g. `let count = 0;`, now use the $state rune, e.g. `let count = $state(0);`._
- Arrays and objects become deeply reactive proxies. For example:
  ```js
  let todos = $state([{ done: false, text: 'add more todos' }]);
  todos[0].done = !todos[0].done;
  ```
- Do **NOT** destructure reactive proxies (e.g., `let { done } = todos[0];`), as this breaks reactivity; instead, access properties directly.
- Use `$state` in class fields for reactive properties. For example:
  ```js
  class Todo {
  	done = $state(false);
  	text = $state('');
  	reset = () => {
  		this.text = '';
  		this.done = false;
  	};
  }
  ```

### $state.raw

- `$state.raw` creates shallow state where mutations are not tracked. For example:

```js
let person = $state.raw({ name: 'Heraclitus', age: 49 });
// Instead of mutating:
// person.age += 1;  // NO effect
person = { name: 'Heraclitus', age: 50 }; // Correct way to update
```

- Do **NOT** attempt to mutate properties on raw state; instead, reassign the entire object to trigger updates.

### $state.snapshot

- `$state.snapshot` produces a plain object copy of reactive state. For example:

```svelte
<script>
	let counter = $state({ count: 0 });
	function logSnapshot() {
		console.log($state.snapshot(counter));
	}
</script>
```

- **ONLY** use this if you are told there's a problem with passing reactive proxies to external APIs.

### Passing state into functions

- Pass-by-Value Semantics: Use getter functions to ensure functions access the current value of reactive state. For example:
  ```js
  function add(getA, getB) {
  	return () => getA() + getB();
  }
  let a = 1,
  	b = 2;
  let total = add(
  	() => a,
  	() => b
  );
  console.log(total());
  ```
- Do **NOT** assume that passing a reactive state variable directly maintains live updates; instead, pass getter functions.  
  _In Svelte 4, you often used stores with subscribe methods; now prefer getter functions with `$state` / `$derived` instead._

### $derived

- `$derived` computes reactive values based on dependencies. For example:

```svelte
<script>
	let count = $state(0);
	let doubled = $derived(count * 2);
</script>

<button onclick={() => count++}>{doubled}</button>
```

- Do **NOT** introduce side effects in derived expressions; instead, keep them pure.  
  _In Svelte 4 you used `$:` for this, e.g. `$: doubled = count * 2;`, now use the $derived rune instead, e.g `let doubled = $derived(count * 2);`._

#### $derived.by

- Use `$derived.by` for multi-line or complex logic. For example:

```svelte
<script>
	let numbers = $state([1, 2, 3]);
	let total = $derived.by(() => {
		let sum = 0;
		for (const n of numbers) sum += n;
		return sum;
	});
</script>
```

- Do **NOT** force complex logic into a single expression; instead, use `$derived.by` to keep code clear.

#### Overriding derived values

- You can reassign a derived value for features like optimistic UI. It will go back to the `$derived` value once an update in its dependencies happen. For example:

```svelte
<script>
	let post = $props().post;
	let likes = $derived(post.likes);
	async function onclick() {
		likes += 1;
		try {
			await post.like();
		} catch {
			likes -= 1;
		}
	}
</script>
```

- Do **NOT** try to override derived state via effects; instead, reassign directly when needed.  
  _In Svelte 4 you could use `$:` for that, e.g. `$: likes = post.likes; likes = 1`, now use the `$derived` instead, e.g. `let likes = $derived(post.likes); likes = 1;`._

### $effect

- `$effect` executes functions when reactive state changes. For example:

```svelte
<script>
	let size = $state(50);
	$effect(() => {
		console.log('Size changed:', size);
	});
</script>
```

- Do **NOT** use `$effect` for state synchronization; instead, use it only for side effects like logging or DOM manipulation.  
  _In Svelte 4, you used reactive statements (`$:`) for similar tasks, .e.g `$: console.log(size)`; now use the `$effect` rune instead, e.g. `$effect(() => console.log(size))` ._

#### Understanding lifecycle (for $effect)

- Effects run after the DOM updates and can return teardown functions. For example:

```svelte
<script>
	let count = $state(0);
	$effect(() => {
		const interval = setInterval(() => {
			count += 1;
		}, 1000);
		return () => clearInterval(interval);
	});
</script>
```

- **Directive:** Do **NOT** ignore cleanup; instead, always return a teardown function when needed.

#### $effect.pre

- `$effect.pre` works like `$effect` with the only difference that it runs before the DOM updates. For example:

```svelte
<script>
	let div = $state();
	$effect.pre(() => {
		if (div) console.log('Running before DOM update');
	});
</script>
```

- Do **NOT** use `$effect.pre` for standard post-update tasks; instead, reserve it for pre-DOM manipulation like autoscrolling.

#### $effect.tracking

- `$effect.tracking` indicates if code is running inside a reactive context. For example:

```svelte
<script>
	$effect(() => {
		console.log('Inside effect, tracking:', $effect.tracking());
	});
</script>
```

- Do **NOT** misuse tracking information outside its intended debugging context; instead, use it to enhance reactive debugging.  
  _In Svelte 4, no equivalent existed; now this feature offers greater insight into reactivity._

#### $effect.root

- `$effect.root` creates a non-tracked scope for nested effects with manual cleanup. For example:

```svelte
<script>
	let count = $state(0);
	const cleanup = $effect.root(() => {
		$effect(() => {
			console.log('Count is:', count);
		});
		return () => console.log('Root effect cleaned up');
	});
</script>
```

- Do **NOT** expect root effects to auto-cleanup; instead, manage their teardown manually.  
  _In Svelte 4, manual cleanup required explicit lifecycle hooks; now `$effect.root` centralizes this control._

### $props

- Use `$props` to access component inputs. For example:

```svelte
<script>
	let { adjective } = $props();
</script>

<p>This component is {adjective}</p>
```

- Do **NOT** mutate props directly; instead, use callbacks or bindable props to communicate changes.  
  _In Svelte 4, props were declared with `export let foo`; now you use `$props` rune, e.g. `let { foo } = $props()`._
- Declare fallback values via destructuring. For example:

```js
let { adjective = 'happy' } = $props();
```

- Rename props to avoid reserved keywords. For example:

```js
let { super: trouper } = $props();
```

- Use rest syntax to collect all remaining props. For example:

```js
let { a, b, ...others } = $props();
```

#### $props.id()

- Generate a unique ID for the component instance. For example:

```svelte
<script>
	const uid = $props.id();
</script>

<label for="{uid}-firstname">First Name:</label>
<input id="{uid}-firstname" type="text" />
```

- Do **NOT** manually generate or guess IDs; instead, rely on `$props.id()` for consistency.

### $bindable

- Mark props as bindable to allow two-way data flow. For example, in `FancyInput.svelte`:

```svelte
<script>
	let { value = $bindable() } = $props();
</script>

<input bind:value />
```

- Do **NOT** overuse bindable props; instead, default to one-way data flow unless bi-directionality is truly needed.  
  _In Svelte 4, all props were implicitly bindable; in Svelte 5 `$bindable` makes this explicit._

### $host

- Only available inside custom elements. Access the host element for custom event dispatching. For example:

```svelte
<script>
	function dispatch(type) {
		$host().dispatchEvent(new CustomEvent(type));
	}
</script>

<button onclick={() => dispatch('increment')}>Increment</button>
```

- Do **NOT** use this unless you are explicitly tasked to create a custom element using Svelte components

### {#snippet ...}

- **Definition & Usage:**  
  Snippets allow you to define reusable chunks of markup with parameters inside your component.  
  _Example:_
  ```svelte
  {#snippet figure(image)}
  	<figure>
  		<img src={image.src} alt={image.caption} width={image.width} height={image.height} />
  		<figcaption>{image.caption}</figcaption>
  	</figure>
  {/snippet}
  ```
- **Parameterization:**  
  Snippets accept multiple parameters with optional defaults and destructuring, but rest parameters are not allowed.  
  _Example with parameters:_
  ```svelte
  {#snippet name(param1, param2)}
  	<!-- snippet markup here -->
  {/snippet}
  ```

### Snippet scope

- **Lexical Visibility:**  
  Snippets can be declared anywhere and reference variables from their outer lexical scope, including script or block-level declarations.  
  _Example:_

  ```svelte
  <script>
  	let { message = "it's great to see you!" } = $props();
  </script>

  {#snippet hello(name)}
  	<p>hello {name}! {message}!</p>
  {/snippet}
  {@render hello('alice')}
  ```

- **Scope Limitations:**  
  Snippets are only accessible within their lexical scope; siblings and child blocks share scope, but nested snippets cannot be rendered outside.  
  _Usage caution:_ Do **NOT** attempt to render a snippet outside its declared scope.

### Passing snippets to components

- **As Props:**  
  Within a template, snippets are first-class values that can be passed to components as props.  
  _Example:_

  ```svelte
  <script>
  	import Table from './Table.svelte';
  	const fruits = [
  		{ name: 'apples', qty: 5, price: 2 },
  		{ name: 'bananas', qty: 10, price: 1 },
  	];
  </script>

  {#snippet header()}
  	<th>fruit</th>
  	<th>qty</th>
  	<th>price</th>
  	<th>total</th>
  {/snippet}
  {#snippet row(d)}
  	<td>{d.name}</td>
  	<td>{d.qty}</td>
  	<td>{d.price}</td>
  	<td>{d.qty * d.price}</td>
  {/snippet}
  <Table data={fruits} {header} {row} />
  ```

- **Slot-like Behavior:**  
  Snippets declared inside component tags become implicit props (akin to slots) for the component.  
  _Svelte 4 used slots for this, e.g. `<Component><p slot="x" let:y>hi {y}</p></Component>`; now use snippets instead, e.g. `<Component>{#snippet x(y)}<p>hi {y}</p>{/snippet}</Component>`._
- **Content Fallback:**  
  Content not wrapped in a snippet declaration becomes the `children` snippet, rendering as fallback content.  
  _Example:_

  ```svelte
  <!-- Button.svelte -->
  <script>
  	let { children } = $props();
  </script>

  <!-- App.svelte -->
  <Button>click me</Button>
  <button>{@render children()}</button>
  ```

### Typing snippets

- Snippets implement the `Snippet` interface, enabling strict type checking in TypeScript or JSDoc.  
  _Example:_

```svelte
<script lang="ts">
	import type { Snippet } from 'svelte';
	interface Props {
		data: any[];
		children: Snippet;
		row: Snippet<[any]>;
	}
	let { data, children, row }: Props = $props();
</script>
```

### {@render ...}

- Use the {@render ...} tag to invoke and render a snippet, passing parameters as needed.  
  _Example:_
  ```svelte
  {#snippet sum(a, b)}
  	<p>{a} + {b} = {a + b}</p>
  {/snippet}
  {@render sum(1, 2)}
  ```
- Do **NOT** call snippets without parentheses when parameters are required; instead, always invoke the snippet correctly.  
  _In Svelte 4, you used slots for this, e.g. `<slot name="sum" {a} {b} />`; now use `{@render}` instead, e.g. `{@render sum(a,b)}`._

### <svelte:boundary>

- Use error boundary tags to prevent rendering errors in a section from crashing the whole app.
  _Example:_

  ```svelte
  <svelte:boundary onerror={(error, reset) => console.error(error)}>
  	<FlakyComponent />
  </svelte:boundary>
  ```

- **Failed Snippet for Fallback UI:**  
  Providing a `failed` snippet renders fallback content when an error occurs and supplies a `reset` function.  
  _Example:_

  ```svelte
  <svelte:boundary>
  	<FlakyComponent />
  	{#snippet failed(error, reset)}
  		<button onclick={reset}>Oops! Try again</button>
  	{/snippet}
  </svelte:boundary>
  ```

### class

- Svelte 5 allows objects for conditional class assignment using truthy keys. It closely follows the `clsx` syntax  
  _Example:_

```svelte
<script>
	let { cool } = $props();
</script>

<div class={{ cool, lame: !cool }}>Content</div>
```

# SvelteKit documentation

## Project types

SvelteKit supports all rendering modes: SPA, SSR, SSG, and you can mix them within one project.

## Setup

Scaffold a new SvelteKit project using `npx sv create` then follow the instructions. Do NOT use `npm create svelte` anymore, this command is deprecated.

A SvelteKit project needs a `package.json` with the following contents at minimum:

```json
{
	"devDependencies": {
		"@sveltejs/adapter-auto": "^6.0.0",
		"@sveltejs/kit": "^2.0.0",
		"@sveltejs/vite-plugin-svelte": "^5.0.0",
		"svelte": "^5.0.0",
		"vite": "^6.0.0"
	}
}
```

Do NOT put any of the `devDependencies` listed above into `dependencies`, keep them all in `devDependencies`.

It also needs a `vite.config.js` with the following at minimum:

```js
import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [sveltekit()],
});
```

It also needs a `svelte.config.js` with the following at minimum:

```js
import adapter from '@sveltejs/adapter-auto';

export default {
	kit: {
		adapter: adapter(),
	},
};
```

## Project structure

- **`src/` directory:**
  - `lib/` for shared code (`$lib`), `lib/server/` for server‑only modules (`$lib/server`), `params/` for matchers, `routes/` for your pages/components, plus `app.html`, `error.html`, `hooks.client.js`, `hooks.server.js`, and `service-worker.js`.
  - Do **NOT** import server‑only code into client files
- **Top‑level assets & configs:**
  - `static/` for public assets; `tests/` (if using Playwright); config files: `package.json` (with `@sveltejs/kit`, `svelte`, `vite` as devDeps), `svelte.config.js`, `tsconfig.json` (or `jsconfig.json`, extending `.svelte-kit/tsconfig.json`), and `vite.config.js`.
  - Do **NOT** forget `"type": "module"` in `package.json` if using ESM.
- **Build artifacts:**
  - `.svelte-kit/` is auto‑generated and safe to ignore or delete; it will be recreated on `dev`/`build`.
  - Do **NOT** commit `.svelte-kit/` to version control.

## Routing

- **Filesystem router:** `src/routes` maps directories to URL paths: Everything with a `+page.svelte` file inside it becomes a visitable URL, e.g. `src/routes/hello/+page.svelte` becomes `/hello`. `[param]` folders define dynamic segments. Do NOT use other file system router conventions, e.g. `src/routes/hello.svelte` does NOT become available als URL `/hello`
- **Route files:** Prefix with `+`: all run server‑side; only non‑`+server` run client‑side; `+layout`/`+error` apply recursively.
- **Best practice:** Do **not** hard‑code routes in code; instead rely on the filesystem convention.

### +page.svelte

- Defines UI for a route, SSR on first load and CSR thereafter
- Do **not** fetch data inside the component; instead use a `+page.js` or `+page.server.js` `load` function; access its return value through `data` prop via `let { data } = $props()` (typed with `PageProps`).

```svelte
<script lang="ts">
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
</script>

<h1>{data.title}</h1>
```

### +page.js

- Load data for pages via `export function load({ params })` (typed `PageLoad`), return value is put into `data` prop in component
- Can export `prerender`, `ssr`, and `csr` consts here to influence how page is rendered.
- Do **not** include private logic (DB or env vars), can **not** export `actions` from here; if needed, use `+page.server.js`.

```js
import type { PageLoad } from './$types';

export const load: PageLoad = () => {
  return {
    title: 'Hello world!',
  };
}
```

### +page.server.js

- `export async function load(...)` (typed `PageServerLoad`) to access databases or private env; return serializable data.
- Can also export `actions` for `<form>` handling on the server.

### +error.svelte

- Add `+error.svelte` in a route folder to render an error page, can use `page.status` and `page.error.message` from `$app/state`.
- SvelteKit walks up routes to find the closest boundary; falls back to `src/error.html` if none.

### +layout.svelte

- Place persistent elements (nav, footer) and include `{@render children()}` to render page content. Example:

```svelte
<script>
	import { LayoutProps } from './$types';
	let { children, data } = $props();
</script>

<p>Some Content that is shared for all pages below this layout</p>
<!-- child layouts/page goes here -->
{@render children()}
```

- Create subdirectory `+layout.svelte` to scope UI to nested routes, inheriting parent layouts.
- Use layouts to avoid repeating common markup; do **not** duplicate UI in every `+page.svelte`.

### +layout.js / +layout.server.js

- In `+layout.js` or `+layout.server.js` export `load()` (typed `LayoutLoad`) to supply `data` to the layout and its children; set `prerender`, `ssr`, `csr`.
- Use `+layout.server.js` (typed `LayoutServerLoad`) for server-only things like DB or env access.
- Do **not** perform server‑only operations in `+layout.js`; use the server variant.

```js
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = () => {
	return {
		sections: [
			{ slug: 'profile', title: 'Profile' },
			{ slug: 'notifications', title: 'Notifications' }
		]
	};
}
```

### +server.js (Endpoints)

- Export HTTP handlers (`GET`, `POST`, etc.) in `+server.js` under `src/routes`; receive `RequestEvent`, return `Response` or use `json()`, `error()`, `redirect()` (exported from `@sveltejs/kit`).
- export `fallback` to catch all other methods.

```js
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ url }) => {
	return new Response('hello world');
}
```

### $types

- SvelteKit creates `$types.d.ts` with `PageProps`, `LayoutProps`, `RequestHandler`, `PageLoad`, etc., for type‑safe props and loaders.
- Use them inside `+page.svelte`/`+page.server.js`/`+page.js`/`+layout.svelte`/`+layout.server.js`/`+layout.js` by importing from `./$types`

### Other files

- Any non‑`+` files in route folders are ignored by the router, use this to your advantage to colocate utilities or components.
- For cross‑route imports, place modules under `src/lib` and import via `$lib`.

## Loading data

### Page data

- `+page.js` exports a `load` (`PageLoad`) whose returned object is available in `+page.svelte` via `let { data } = $props()` (e.g. when you do `return { foo }` from `load` it is available within `let { data } = $props()` in `+page.svelte` as `data.foo`)
- Universal loads run on SSR and CSR; private or DB‑backed loads belong in `+page.server.js` (`PageServerLoad`) and must return devalue‑serializable data.

Example:

```js
// file: src/routes/foo/+page.js
export async function load({ fetch }) {
	const result = await fetch('/data/from/somewhere').then((r) => r.json());
	return { result }; // return property "result"
}
```

```svelte
<!-- file: src/routes/foo/+page.svelte -->
<script>
	// "data" prop contains property "result"
	let { data } = $props();
</script>

{data.result}
```

### Layout data

- `+layout.js` or `+layout.server.js` exports a `load` (`LayoutLoad`/`LayoutServerLoad`)
- Layout data flows downward: child layouts and pages see parent data in their `data` prop.
- Data loading flow (interaction of load function and props) works the same as for `+page(.server).js/svelte`

### page.data

- The `page` object from `$app/state` gives access to all data from `load` functions via `page.data`, usable in any layout or page.
- Ideal for things like `<svelte:head><title>{page.data.title}</title></svelte:head>`.
- Types come from `App.PageData`
- earlier Svelte versions used `$app/stores` for the same concepts, do NOT use `$app/stores` anymore unless prompted to do so

### Universal vs. server loads

- Universal (`+*.js`) run on server first, then in browser; server (`+*.server.js`) always run server‑side and can use secrets, cookies, DB, etc.
- Both receive `params`, `route`, `url`, `fetch`, `setHeaders`, `parent`, `depends`; server loads additionally get `cookies`, `locals`, `platform`, `request`.
- Use server loads for private data or non‑serializable items; universal loads for public APIs or returning complex values (like constructors).

### Load function arguments

- `url` is a `URL` object (no `hash` server‑side); `route.id` shows the route pattern; `params` map path segments to values.
- Query parameters via `url.searchParams` trigger reruns when they change.
- Use these to branch logic and fetch appropriate data in `load`.

## Making Fetch Requests

Use the provided `fetch` function for enhanced features:

```js
// src/routes/items/[id]/+page.js
export async function load({ fetch, params }) {
	const res = await fetch(`/api/items/${params.id}`);
	const item = await res.json();
	return { item };
}
```

## Headers and Cookies

Set response headers using `setHeaders`:

```js
export async function load({ fetch, setHeaders }) {
	const response = await fetch(url);

	setHeaders({
		age: response.headers.get('age'),
		'cache-control': response.headers.get('cache-control'),
	});

	return response.json();
}
```

Access cookies in server load functions using `cookies`:

```js
export async function load({ cookies }) {
	const sessionid = cookies.get('sessionid');
	return {
		user: await db.getUser(sessionid),
	};
}
```

Do not set `set-cookie` via `setHeaders`; use `cookies.set()` instead.

## Using Parent Data

Access data from parent load functions:

```js
export async function load({ parent }) {
	const { a } = await parent();
	return { b: a + 1 };
}
```

## Errors and Redirects

Redirect users using `redirect`:

```js
import { redirect } from '@sveltejs/kit';

export function load({ locals }) {
	if (!locals.user) {
		redirect(307, '/login');
	}
}
```

Throw expected errors using `error`:

```js
import { error } from '@sveltejs/kit';

export function load({ locals }) {
	if (!locals.user) {
		error(401, 'not logged in');
	}
}
```

Unexpected exceptions trigger `handleError` hook and a 500 response.

## Streaming with Promises

Server load functions can stream promises as they resolve:

```js
export async function load({ params }) {
	return {
		comments: loadComments(params.slug),
		post: await loadPost(params.slug),
	};
}
```

```svelte
<h1>{data.post.title}</h1>
<div>{@html data.post.content}</div>

{#await data.comments}
	Loading comments...
{:then comments}
	{#each comments as comment}
		<p>{comment.content}</p>
	{/each}
{:catch error}
	<p>error loading comments: {error.message}</p>
{/await}
```

## Rerunning Load Functions

Load functions rerun when:

- Referenced params or URL properties change
- A parent load function reran and `await parent()` was called
- A dependency was invalidated with `invalidate(url)` or `invalidateAll()`

Manually invalidate load functions:

```js
// In load function
export async function load({ fetch, depends }) {
	depends('app:random');
	// ...
}

// In component
import { invalidate } from '$app/navigation';
function rerunLoadFunction() {
	invalidate('app:random');
}
```

## Dependency Tracking

Exclude from dependency tracking with `untrack`:

```js
export async function load({ untrack, url }) {
	if (untrack(() => url.pathname === '/')) {
		return { message: 'Welcome!' };
	}
}
```

### Implications for authentication

- Layout loads don’t automatically rerun on CSR; guards in `+layout.server.js` require child pages to await the parent.
- To avoid missed auth checks and waterfalls, use hooks like `handle` for global protection or per‑page server loads.

### Using getRequestEvent

- `getRequestEvent()` retrieves the current server `RequestEvent`, letting shared functions (e.g. `requireLogin()`) access `locals`, `url`, etc., without parameter passing.

## Using forms

### Form actions

- A `+page.server.js` can export `export const actions: Actions = { default: async (event) => {…} }`; `<form method="POST">` in `+page.svelte` posts to the default action without any JS. `+page.js` or `+layout.js` or `+layout.server.js` can NOT export `actions`
- Name multiple actions (`login`, `register`) in `actions`, invoke with `action="?/register"` or `button formaction="?/register"`; do NOT use `default` name in this case.
- Each action gets `{ request, cookies, params }`, uses `await request.formData()`, sets cookies or DB state, and returns an object that appears on the page as `form` (typed via `PageProps`).

Example: Define a default action in `+page.server.js`:

```js
// file: src/routes/login/+page.server.js
import type { Actions } from './$types';

export const actions: Actions = {
	default: async (event) => {
		// TODO log the user in
	}
};
```

Use it with a simple form:

```svelte
<!-- file: src/routes/login/+page.svelte -->
<form method="POST">
	<label>
		Email
		<input name="email" type="email" />
	</label>
	<label>
		Password
		<input name="password" type="password" />
	</label>
	<button>Log in</button>
</form>
```

### Validation errors

- Return `fail(400, { field, error: true })` from an action to send back status and data; display via `form?.field` and repopulate inputs with `value={form?.field ?? ''}`.
- Use `fail` instead of throwing so the nearest `+error.svelte` isn’t invoked and the user can correct their input.
- `fail` payload must be JSON‑serializable.

### Redirects

- In an action, call `redirect(status, location)` to send a 3xx redirect; this throws and bypasses form re-render.
- Client-side, use `goto()` from `$app/navigation` for programmatic redirects.

### Loading data after actions

- After an action completes (unless redirected), SvelteKit reruns `load` functions and re‑renders the page, merging the action’s return value into `form`.
- The `handle` hook runs once before the action; if you modify cookies in your action, you must also update `event.locals` there to keep `load` in sync.
- Do NOT assume `locals` persists automatically; set `event.locals` inside your action when auth state changes.

### Progressive enhancement

- Apply `use:enhance` from `$app/forms` to `<form>` to intercept submissions, prevent full reloads, update `form`, `page.form`, `page.status`, reset the form, invalidate all data, handle redirects, render errors, and restore focus. Do NOT use onsubmit event for progressive enhancement
- To customize, provide a callback that runs before submit and returns a handler; use `update()` for default logic or `applyAction(result)` to apply form data without full invalidation.
- You can also write your own `onsubmit` listener using `fetch`, then `deserialize` the response and `applyAction`/`invalidateAll`; do NOT use `JSON.parse` for action responses.

```svelte
<script>
	import type { PageProps } from './$types';
	import { enhance } from '$app/forms';
	let { form } = $props();
</script>

<form method="POST" use:enhance>
	<!-- form content -->
</form>
```

## Page options

#### prerender

- Set `export const prerender = true|false|'auto'` in page or layout modules; `true` generates static HTML, `false` skips, `'auto'` includes in SSR manifest.
- Applies to pages **and** `+server.js` routes (inherit parent flags); dynamic routes need `entries()` or `config.kit.prerender.entries` to tell the crawler which parameter values to use.
- Do NOT prerender pages that use form actions or rely on `url.searchParams` server‑side.

#### entries

- In a dynamic route’s `+page(.server).js` or `+server.js`, export `export function entries(): Array<Record<string,string>>` (can be async) to list parameter sets for prerendering.
- Overrides default crawling to ensure dynamic pages (e.g. `/blog/[slug]`) are generated.
- Do NOT forget to pair `entries()` with `export const prerender = true`.

### ssr

- `export const ssr = false` disables server-side rendering, sending only an HTML shell and turning the page into a client-only SPA.
- Use sparingly (e.g. when using browser‑only globals); do NOT set both `ssr` and `csr` to `false` or nothing will render.

#### csr

- `export const csr = false` prevents hydration, omits JS bundle, disables `<script>`s, form enhancements, client routing, and HMR.
- Ideal for purely static pages (e.g. marketing or blog posts); do NOT disable CSR on pages requiring interactivity.

## State management

- Avoid shared server variables—servers are stateless and shared across users. Authenticate via cookies and persist to a database instead of writing to in‑memory globals.
- Keep `load` functions pure: no side‑effects or global store writes. Return data from `load` and pass it via `data` or `page.data`.
- For shared client‑only state across components, use Svelte’s context API (`setContext`/`getContext`) or URL parameters for persistent filters; snapshots for ephemeral UI state tied to navigation history.

## Building your app

- Build runs in two phases: Vite compiles and prerenders (if enabled), then an adapter tailors output for your deployment target.
- Guard any code that should not execute at build time with `import { building } from '$app/environment'; if (!building) { … }`.
- Preview your production build locally with `npm run preview` (Node‑only, no adapter hooks).

## Adapters

- Adapters transform the built app into deployable assets for various platforms (Cloudflare, Netlify, Node, static, Vercel, plus community adapters).
- Configure in `svelte.config.js` under `kit.adapter = adapter(opts)`, importing the adapter module and passing its options.
- Some adapters expose a `platform` object (e.g. Cloudflare’s `env`); access it via `event.platform` in hooks and server routes.

## Single‑page apps

- Turn your app into a fully CSR SPA by setting `export const ssr = false;` in the root `+layout.js`.
- For static hosting, use `@sveltejs/adapter-static` with a `fallback` HTML (e.g. `200.html`) so client routing can handle unknown paths.
- You can still prerender select pages by enabling `prerender = true` and `ssr = true` in their individual `+page.js` or `+layout.js` modules.

## Advanced routing

- Rest parameters (`[...file]`) capture an unknown number of segments (e.g. `src/routes/hello/[...path]` catches all routes under `/hello`) and expose them as a single string; use a catch‑all route `+error.svelte` to render nested custom 404 pages.
- Optional parameters (`[[lang]]`) make a segment optional, e.g. for `[[lang]]/home` both `/home` and `/en/home` map to the same route; cannot follow a rest parameter.
- Matchers in `src/params/type.js` let you constrain `[param=type]` (e.g. only “apple” or “orange”), falling back to other routes or a 404 if the test fails.

### Advanced layouts

- Group directories `(app)` or `(marketing)` apply a shared layout without affecting URLs.
- Break out of the inherited layout chain per page with `+page@segment.svelte` (e.g. `+page@(app).svelte`) or per layout with `+layout@.svelte`.
- Use grouping judiciously: overuse can complicate nesting; sometimes simple composition or wrapper components suffice.

## Hooks

### Server hooks

- `handle({ event, resolve })`: runs on every request; mutate `event.locals`, bypass routing, or call `resolve(event, { transformPageChunk, filterSerializedResponseHeaders, preload })` to customize HTML, headers, and asset preloading.
- `handleFetch({ event, request, fetch })`: intercepts server‑side `fetch` calls to rewrite URLs, forward cookies on cross‑origin, or route internal requests directly to handlers.
- `init()`: runs once at server startup for async setup (e.g. database connections).

### Shared hooks

- `handleError({ error, event, status, message })`: catches unexpected runtime errors on server or client; log via Sentry or similar, return a safe object (e.g. `{ message: 'Oops', errorId }`) for `$page.error`.

### Universal hooks

- `reroute({ url, fetch? })`: map incoming `url.pathname` to a different route ID (without changing the address bar), optionally async and using `fetch`.
- `transport`: define `encode`/`decode` for custom types (e.g. class instances) to serialize them across server/client boundaries in loads and actions.

## Errors

- Expected errors thrown with `error(status, message|object)` set the response code, render the nearest `+error.svelte` with `page.error`, and let you pass extra props (e.g. `{ code: 'NOT_FOUND' }`).
- Unexpected exceptions invoke the `handleError` hook, are logged internally, and expose a generic `{ message: 'Internal Error' }` to users; customize reporting or user‑safe messages in `handleError`.
- Errors in server handlers or `handle` return JSON or your `src/error.html` fallback based on `Accept` headers; errors in `load` render component boundaries as usual. Type‑safe shapes via a global `App.Error` interface.

## Link options

The following are HTML attributes you can put on any HTML element.

- `data-sveltekit-preload-data="hover"|"tap"` preloads `load` on link hover (`touchstart`) or immediate tap; use `"tap"` for fast‑changing data.
- `data-sveltekit-preload-code="eager"|"viewport"|"hover"|"tap"` preloads JS/CSS aggressively or on scroll/hover/tap to improve load times.
- `data-sveltekit-reload` forces full-page reload; `data-sveltekit-replacestate` uses `replaceState`; `data-sveltekit-keepfocus` retains focus; `data-sveltekit-noscroll` preserves scroll position; disable any by setting the value to `"false"`.

## Server-only modules

- `$env/static/private` and `$env/dynamic/private` can only be imported into server‑only files (`hooks.server.js`, `+page.server.js`); prevents leaking secrets to the client.
- `$app/server` (e.g. the `read()` API) is likewise restricted to server‑side code.
- Make your own modules server‑only by naming them `*.server.js` or placing them in `src/lib/server/`; any public‑facing import chain to these files triggers a build error.

## Shallow routing

- Use `pushState(path, state)` or `replaceState('', state)` from `$app/navigation` to create history entries without full navigation; read/write `page.state` from `$app/state`.
- Ideal for UI like modals: `if (page.state.showModal) <Modal/>` and dismiss with `history.back()`.
- To embed a route’s page component without navigation, preload data with `preloadData(href)` then `pushState`, falling back to `goto`; note SSR and initial load have empty `page.state`, and shallow routing requires JS.

## Images

- Vite’s asset handling inlines small files, adds hashes, and lets you `import logo from '...png'` for use in `<img src={logo}>`.
- Install `@sveltejs/enhanced-img` and add `enhancedImages()` to your Vite config; use `<enhanced:img src="...jpg" alt="…"/>` to auto‑generate `<picture>` tags with AVIF/WebP, responsive `srcset`/`sizes`, and intrinsic dimensions.
- For CMS or dynamic images, leverage a CDN with Svelte libraries like `@unpic/svelte`; always supply high‑resolution originals (2×), specify `sizes` for LCP images, set `fetchpriority="high"`, constrain layout via CSS to avoid CLS, and include meaningful `alt` text.

## Reference docs

### Imports from `@sveltejs/kit`

- **error**: throw an HTTP error and halt request processing

  ```js
  import { error } from '@sveltejs/kit';
  export function load() {
  	error(404, 'Not found');
  }
  ```

- **fail**: return a form action failure without throwing

  ```js
  import { fail } from '@sveltejs/kit';
  export const actions = {
  	default: async ({ request }) => {
  		const data = await request.formData();
  		if (!data.get('name')) return fail(400, { missing: true });
  	},
  };
  ```

- **isActionFailure**: type‑guard for failures from `fail`

  ```js
  import { isActionFailure } from '@sveltejs/kit';
  if (isActionFailure(result)) {
  	/* handle invalid form */
  }
  ```

- **isHttpError**: type‑guard for errors from `error`

  ```js
  import { isHttpError } from '@sveltejs/kit';
  try {
  	/* … */
  } catch (e) {
  	if (isHttpError(e, 404)) console.log('Not found');
  }
  ```

- **isRedirect**: type‑guard for redirects from `redirect`

  ```js
  import { redirect, isRedirect } from '@sveltejs/kit';
  try {
  	redirect(302, '/login');
  } catch (e) {
  	if (isRedirect(e)) console.log('Redirecting');
  }
  ```

- **json**: build a JSON `Response`

  ```js
  import { json } from '@sveltejs/kit';
  export function GET() {
  	return json({ hello: 'world' });
  }
  ```

- **normalizeUrl** _(v2.18+)_: strip internal suffixes/trailing slashes

  ```js
  import { normalizeUrl } from '@sveltejs/kit';
  const { url, denormalize } = normalizeUrl('/foo/__data.json');
  url.pathname; // /foo
  ```

- **redirect**: throw a redirect response

  ```js
  import { redirect } from '@sveltejs/kit';
  export function load() {
  	redirect(303, '/dashboard');
  }
  ```

- **text**: build a plain‑text `Response`

  ```js
  import { text } from '@sveltejs/kit';
  export function GET() {
  	return text('Hello, text!');
  }
  ```

### Imports from `@sveltejs/kit/hooks`

- **sequence**: compose multiple `handle` hooks into one, merging their options

  ```js
  import { sequence } from '@sveltejs/kit/hooks';
  export const handle = sequence(handleOne, handleTwo);
  ```

### Imports from `$app/forms`

- **applyAction**: apply an `ActionResult` to update `page.form` and `page.status`

  ```js
  import { applyAction } from '$app/forms';
  // inside enhance callback:
  await applyAction(result);
  ```

- **deserialize**: parse a serialized form action response back into `ActionResult`

  ```js
  import { deserialize } from '$app/forms';
  const result = deserialize(await response.text());
  ```

- **enhance**: progressively enhance a `<form>` for AJAX submissions

  ```svelte
  <script>
    import { enhance } from '$app/forms';
  </script>
  <form use:enhance on:submit={handle}>
  ```

### Imports from `$app/navigation`

- **afterNavigate**: run code after every client‑side navigation. Needs to be called at component initialization

  ```js
  import { afterNavigate } from '$app/navigation';
  afterNavigate(({ type, to }) => console.log('navigated via', type));
  ```

- **beforeNavigate**: intercept and optionally cancel upcoming navigations. Needs to be called at component initialization

  ```js
  import { beforeNavigate } from '$app/navigation';
  beforeNavigate(({ cancel }) => {
  	if (!confirm('Leave?')) cancel();
  });
  ```

- **disableScrollHandling**: disable automatic scroll resetting after navigation

  ```js
  import { disableScrollHandling } from '$app/navigation';
  disableScrollHandling();
  ```

- **goto**: programmatically navigate within the app

  ```svelte
  <script>
  	import { goto } from '$app/navigation';
  	function navigate() {
  		goto('/dashboard', { replaceState: true });
  	}
  </script>

  <button onclick={navigate}>navigate</button>
  ```

- **invalidate**: re‑run `load` functions that depend on a given URL or custom key

  ```js
  import { invalidate } from '$app/navigation';
  await invalidate('/api/posts');
  ```

- **invalidateAll**: re‑run every `load` for the current page

  ```js
  import { invalidateAll } from '$app/navigation';
  await invalidateAll();
  ```

- **onNavigate**: hook invoked immediately before client‑side navigations. Needs to be called at component initialization

  ```js
  import { onNavigate } from '$app/navigation';
  onNavigate(({ to }) => console.log('about to go to', to.url));
  ```

- **preloadCode**: import route modules ahead of navigation (no data fetch)

  ```js
  import { preloadCode } from '$app/navigation';
  await preloadCode('/about');
  ```

- **preloadData**: load both code and data for a route ahead of navigation

  ```js
  import { preloadData } from '$app/navigation';
  const result = await preloadData('/posts/1');
  ```

- **pushState**: create a shallow‑routing history entry with custom state

  ```js
  import { pushState } from '$app/navigation';
  pushState('', { modalOpen: true });
  ```

- **replaceState**: replace the current history entry with new custom state

  ```js
  import { replaceState } from '$app/navigation';
  replaceState('', { modalOpen: false });
  ```

### Imports from `$app/paths`

- **assets**: the absolute URL prefix for static assets (`config.kit.paths.assets`)

  ```js
  import { assets } from '$app/paths';
  console.log(`<img src="${assets}/logo.png">`);
  ```

- **base**: the base path for your app (`config.kit.paths.base`)

  ```svelte
  <a href="{base}/about">About Us</a>
  ```

- **resolveRoute**: interpolate a route ID with parameters to form a pathname

  ```js
  import { resolveRoute } from '$app/paths';
  resolveRoute('/blog/[slug]/[...rest]', {
  	slug: 'hello',
  	rest: '2024/updates',
  });
  // → "/blog/hello/2024/updates"
  ```

### Imports from `$app/server`

- **getRequestEvent** _(v2.20+)_: retrieve the current server `RequestEvent`

  ```js
  import { getRequestEvent } from '$app/server';
  export function load() {
  	const event = getRequestEvent();
  	console.log(event.url);
  }
  ```

- **read** _(v2.4+)_: read a static asset imported by Vite as a `Response`

  ```js
  import { read } from '$app/server';
  import fileUrl from './data.txt';
  const res = read(fileUrl);
  console.log(await res.text());
  ```

- **navigating**: a read‑only object describing any in‑flight navigation (or `null`)

  ```svelte
  <script>
  	import { navigating } from '$app/state';
  	console.log(navigating.from, navigating.to);
  </script>
  ```

### Imports from `$app/state`

- **page**: read‑only reactive info about the current page (`url`, `params`, `data`, etc.)

  ```svelte
  <script>
  	import { page } from '$app/state';
  	const path = $derived(page.url.pathname);
  </script>

  {path}
  ```

- **updated**: reactive flag for new app versions; call `updated.check()` to poll immediately

  ```svelte
  <script>
  	import { updated } from '$app/state';
  	$effect(() => {
  		if (updated.current) {
  			alert('A new version is available. Refresh?');
  		}
  	});
  </script>
  ```

### Imports from `$env/dynamic/private`

- **env (dynamic/private)**: runtime private env vars (`process.env…`), not exposed to client

  ```js
  import { env } from '$env/dynamic/private';
  console.log(env.SECRET_API_KEY);
  ```

### Imports from `$env/dynamic/public`

- **env (dynamic/public)**: runtime public env vars (`PUBLIC_…`), safe for client use

  ```js
  import { env } from '$env/dynamic/public';
  console.log(env.PUBLIC_BASE_URL);
  ```

### Imports from `$env/static/private`

- **$env/static/private**: compile‑time private env vars, dead‑code eliminated

  ```js
  import { DATABASE_URL } from '$env/static/private';
  console.log(DATABASE_URL);
  ```

### Imports from `$env/static/public`

- **$env/static/public**: compile‑time public env vars (`PUBLIC_…`), safe on client

  ```js
  import { PUBLIC_WS_ENDPOINT } from '$env/static/public';
  console.log(PUBLIC_WS_ENDPOINT);
  ```

### `$lib` alias

Alias for `src/lib` folder, e.g.

```svelte
<script>
	import Button from '$lib/Button.svelte';
</script>

<Button>Click me</Button>
```

means that there's a component at `src/lib/Button.svelte`.

# Skeleton Core API

Learn about the specific features Skeleton introduces to Tailwind.

{

<p class="text-xl">
	The heart of Skeleton is our framework agnostic core package. This adapts and extends Tailwind to introduce our global styles, color
	system, typography, and more. This section details all available Skeleton-provided utility classes and theme properties.
</p>

}

---

## @base

Extends Tailwind's base layer with a set of opinionated global styles.

<figure class="linker bg-noise">
	<a
		class="btn preset-filled"
		href="https://github.com/skeletonlabs/skeleton/blob/main/packages/skeleton/src/base/globals.css"
		target="_blank"
	>
		View Global Styles
	</a>
</figure>

- Sets the root color scheme to match Dark Mode settings.
- Updates scrollbars to utilize theme colors.
- Updates global text selection to utilize theme colors.
- Defines the `<body>` background colors and base font styles.
- Implements global default styles for disabled states, such as buttons.

## @theme

Uses Tailwind's `@theme` to implement a variety of new properties and utility classes.

<figure class="linker bg-noise">
	<a
		class="btn preset-filled"
		href="https://github.com/skeletonlabs/skeleton/blob/main/packages/skeleton/src/base/theme.scss"
		target="_blank"
	>
		View Theme Properties
	</a>
</figure>

### Colors

Extends colors to include the [Skeleton color palette](/docs/design/colors).

| Class                                 | Theme Property                       |
| ------------------------------------- | ------------------------------------ |
| `[property]-[color]-[shade]`          | {`--`}color-[color]-[shade]          |
| `[property]-[color]-contrast-[shade]` | {`--`}color-[color]-contrast-[shade] |
| `body-background-color`               | {`--`}body-background-color          |
| `body-background-color-dark`          | {`--`}body-background-color-dark     |

### Color Pairings

Extends colors to implement [Color Pairing](/docs/design/colors#color-pairings), which balance colors between light and dark mode.

| Class                                | Theme Property                      |
| ------------------------------------ | ----------------------------------- |
| `[property]-[color]-[shade]-[shade]` | {`--`}color-[color]-[shade]-[shade] |

### Spacing

Integrates Tailwind's [spacing property](https://tailwindcss.com/docs/functions-and-directives#spacing-function) to modify [dynamic scaling](/docs/design/spacing) for various utility classes.

| Class     | Theme Property |
| --------- | -------------- |
| (various) | {`--`}spacing  |

### Typography

Introduces a [typographic scale](https://designcode.io/typographic-scales) to all Tailwind [font sizes](https://tailwindcss.com/docs/font-size) using the following formula.

```plaintext
--text-{size}: calc({remSize} * var(--text-scaling));
--text-{size}--line-height: calc(calc(1 / {remSize}) * var(--text-scaling));
```

#### Base

Controls the style of the global page text.

| Class                  | Theme Property             |
| ---------------------- | -------------------------- |
| `base-font-color`      | {`--`}base-font-color      |
| `base-font-color-dark` | {`--`}base-font-color-dark |
| `base-font-family`     | {`--`}base-font-family     |
| `base-font-size`       | {`--`}base-font-size       |
| `base-line-height`     | {`--`}base-line-height     |
| `base-font-weight`     | {`--`}base-font-weight     |
| `base-font-style`      | {`--`}base-font-style      |
| `base-letter-spacing`  | {`--`}base-letter-spacing  |

#### Heading

Controls the style of the heading text.

| Class                     | Theme Property                |
| ------------------------- | ----------------------------- |
| `heading-font-color`      | {`--`}heading-font-color      |
| `heading-font-color-dark` | {`--`}heading-font-color-dark |
| `heading-font-family`     | {`--`}heading-font-family     |
| `heading-font-size`       | {`--`}heading-font-size       |
| `heading-line-height`     | {`--`}heading-line-height     |
| `heading-font-weight`     | {`--`}heading-font-weight     |
| `heading-font-style`      | {`--`}heading-font-style      |
| `heading-letter-spacing`  | {`--`}heading-letter-spacing  |

#### Anchor

Controls the style of anchor links.

| Class                           | Theme Property                      |
| ------------------------------- | ----------------------------------- |
| `anchor-font-color`             | {`--`}anchor-font-color             |
| `anchor-font-color-dark`        | {`--`}anchor-font-color-dark        |
| `anchor-font-family`            | {`--`}anchor-font-family            |
| `anchor-font-size`              | {`--`}anchor-font-size              |
| `anchor-line-height`            | {`--`}anchor-line-height            |
| `anchor-font-weight`            | {`--`}anchor-font-weight            |
| `anchor-font-style`             | {`--`}anchor-font-style             |
| `anchor-letter-spacing`         | {`--`}anchor-letter-spacing         |
| `anchor-text-decoration`        | {`--`}anchor-text-decoration        |
| `anchor-text-decoration-active` | {`--`}anchor-text-decoration-active |
| `anchor-text-decoration-focus`  | {`--`}anchor-text-decoration-focus  |
| `anchor-text-decoration-hover`  | {`--`}anchor-text-decoration-hover  |

### Radius

Extends Tailwind's radius properties with theme-specific sizes.

| Class               | Theme Property         |
| ------------------- | ---------------------- |
| `rounded-base`      | {`--`}radius-base      |
| `rounded-container` | {`--`}radius-container |

### Edges

Sets the default width for border, divide, and ring width to match the active theme properties.

| Class    | Theme Property             |
| -------- | -------------------------- |
| `border` | {`--`}default-border-width |
| `ring`   | {`--`}default-ring-width   |
| `divide` | {`--`}default-divide-width |

## @utility

<figure class="linker bg-noise">
	<a href="https://github.com/skeletonlabs/skeleton/blob/main/packages/skeleton/src/utilities" target="_blank" class="btn preset-filled">
		View Utilites
	</a>
</figure>

### Tailwind Components

Allow you to style semantic HTML elements with utility classes.

<NavGrid collection="docs" path="tailwind/" classes="md:grid-cols-2" />

## @variant

<figure class="linker bg-noise">
	<a href="https://github.com/skeletonlabs/skeleton/blob/main/packages/skeleton/src/variants" target="_blank" class="btn preset-filled">
		View Variants
	</a>
</figure>

### Themes

Enables you to target and style elements for a particular theme.

```html
<div class="theme-cerberus:bg-red-500 bg-green-500">...</div>
<div class="theme-mona:bg-red-500 bg-green-500">...</div>
<div class="theme-vox:bg-red-500 bg-green-500">...</div>
```

## Optional

### Presets

Provides a canned set of styles for use with buttons, badges, cards, and more.

<figure class="linker bg-noise">
	<a href="/docs/design/presets" class="btn preset-filled">
		Browse Presets
	</a>
</figure>

### Preset Themes

Provides a hand curated set of themes for Skeleton.

<figure class="linker bg-noise">
	<a href="/docs/design/themes" class="btn preset-filled">
		Browse Themes
	</a>
</figure>

---

# Fundamentals

An introduction to the core concepts of Skeleton.

{

<p className="text-xl">
	Skeleton is comprised of three pillars - the design system, our extensions to Tailwind, and an optional suite of framework-specific
	components. Together these form a comprehensive solution for designing and implementing complex web interfaces at scale.
</p>

}

---

## Design System

### Figma UI Kit

A fully featured [Figma UI Kit](/figma) is available to designers, allowing them to quickly draft visual concept of your project.

### Iconography

Skeleton is icon agnostic, meaning you may bring your own iconography solution. However, we highly recommend [Lucide](https://lucide.dev/) and utilize it for all examples in our documentation. Refer to our integration guides for [React](/docs/integrations/iconography/react) and [Svelte](/docs/integrations/iconography/svelte).

### Core Features

The following features fall under the umbrella of our design system. Provided via the Skeleton core.

<NavGrid collection="docs" path="design/" classes="md:grid-cols-2" />

---

## Tailwind

Tailwind components that act as primitives for creating complex interfaces. Provided via the Skeleton core.

<NavGrid collection="docs" path="tailwind/" classes="md:grid-cols-2" />

---

## Components

Skeleton also offers optional component packages for select frameworks, each component automatically adapt to Skeleton's design system.

| Framework | NPM Package                     | Description                                      |
| --------- | ------------------------------- | ------------------------------------------------ |
| React     | `@skeletonlabs/skeleton-react`  | Contains all components and features for React.  |
| Svelte    | `@skeletonlabs/skeleton-svelte` | Contains all components and features for Svelte. |

### Powered by Zag.js

Skeleton's components are built on **Zag.js**, which provides a collection of framework-agnostic UI component patterns to manage logic and state. Zag was founded and maintained by industry veterans, such Segun Adebayo - the creator and core maintainer for [Chakra UI](https://www.chakra-ui.com/).

<figure class="linker bg-noise">
	<a class="btn preset-filled" href="https://zagjs.com/" target="_blank">
		View Zag.js
	</a>
</figure>

### Importing Component

Import the component you wish to use from your framework package of choice, then insert it into your page template.

```ts

```

```ts
<Avatar />
```

### Component Props

Skeleton components properties (aka "props") are loosely defined into the following categories:

- **Functional Props** - directly affect the functionality of the component, such as an `open` or `src`.
- **Style Props** - accept Tailwind utility classes to affect styling, such as `background` for background color.
- **Event Props** - callback functions that trigger upon interaction, such as `onclick`, `onkeypress`, and more.

In the example below, we set functional props for `src` and `alt`, while also including a style prop for `background`.

```ts
<Avatar src={someUrl} alt="Jane" background="bg-red-500" />
```

### Style Props

Skeleton components are styled by default out of the box. However, if you wish to customize the look and feel, then you may do so utilizing Style Props. These fall into a few sub-categories.

- `base` - the default styles for each component template element, implemented by default.
- `{property}` - take individual utility classes to customize styling, such as `background`, `padding`, or `margin`.
- `classes` - allows you to pass any arbitrary utility classes and extend the class list. Note this is plural.

Imagine the Avatar component was created like so:

```ts title="Example Props"
{
	src = './some-placeholder.jpg',
	alt = '',
	// ...
	base = 'flex justify-center items-center overflow-hidden',
	background = 'bg-slate-500',
	rounded = 'rounded-full',
	// ...
	classes = '',
}
```

```svelte title="Example Template"
<figure class="{base} {background} {size} {font} {border} {rounded} {shadow} {classes}">
	<img {src} alt={name} class="{imageBase} {imageClasses}" />
</figure>
```

We can use the `background` style prop to replace the default background color.

```svelte
<Avatar background="bg-blue-500">Sk</Avatar>
```

Since the component doesn't have a dedicated `border` prop, we can extend our class list using `classes`.

```svelte
<Avatar classes="border-4 border-green-500">Sk</Avatar>
```

And we can optionally replace the default `base` styles like so. Just remember our other `{property}` styles will remain.

```svelte
<Avatar base="flex justify-center items-center overflow-visible">Sk</Avatar>
```

Additionally, child elements within the template use these same conventions, but prefixed like `imageBase` and `imageClasses`.

```svelte
<Avatar ... imageClasses="grayscale" />
```

Consult each component's [API reference](/docs/components/accordion/react#api-reference) for a complete list of available properties.

### Learn More

For a comprehensive understanding of how Skeleton implements our components, please refer to our [contribution guidelines](/docs/resources/contribute/components).

---

# Installation

Learn how to install and setup Skeleton for your project.

<NavGrid collection="docs" path="installation/" classes="md:grid-cols-2" />

## Mixing UI Libraries

Skeleton's design system is perfect for complementing headless component libraries, such as [Melt UI](https://www.melt-ui.com/), [Radix](https://www.radix-ui.com/), and [Zag.js](https://zagjs.com/). As well as "Tailwind component" libraries such as the [Tailwind UI](https://tailwindui.com/). Supporting any component system that supports Tailwind, but very specifically allows you to insert or substitute Skeleton-provided utility classes.

### Unsupported Libraries

Unfortunately, Skeleton cannot integrate with [Flowbite React](https://flowbite-react.com/), [Flowbite Svelte](https://flowbite-svelte.com/), or [Daisy UI](https://daisyui.com/) at this time. Similar to Skeleton, these libraries depend on their own dedicated Tailwind plugin that directly overlaps with many of our core features, including class names and color values.

---

# Introduction

Skeleton integrates with Tailwind to provide an opinionated solution for generating adaptive design systems. Including easy to use components for your favorite web frameworks.

<iframe
	class="rounded-container aspect-video w-full overflow-hidden"
	src="https://www.youtube.com/embed/tHzVyChDuyo"
	title="YouTube video player"
	frameborder="0"
	allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
	allowfullscreen
/>

## Our Philosophy

Skeleton provides a uniform design language and structured framework for controlling the look and feel of your product and user experience. It serves as an opinionated design system that aims to greatly reduce the amount of time spent managing design elements and patterns, allowing you to more quickly build and manage your frontend interfaces at scale.

{

<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
	<div className="card preset-outlined-surface-200-800 bg-surface-50-950 p-10 space-y-4">
		<h3 className="h3">Framework Agnostic</h3>
		<p className="text-surface-700-300">
			Skeleton's core features are framework agnostic, only requiring the use of{' '}
			<a className="anchor" href="https://tailwindcss.com/" target="_blank" rel="external">
				Tailwind CSS
			</a>
			. This provides full access to all design system features, while enabling you to standardize the design process for your framework of
			choice.
		</p>
	</div>
	<div className="card preset-outlined-surface-200-800 bg-surface-50-950 p-10 space-y-4">
		<h3 className="h3">Native-First</h3>
		<p className="text-surface-700-300">
			We aim to embrace the interface of the web, not replace it. This is why Skeleton defaults to semantic HTML elements and native browser
			APIs. Beyond ease of use, we feel this offers a huge advantages to accessibility.
		</p>
	</div>
	<div className="card preset-outlined-surface-200-800 bg-surface-50-950 p-10 space-y-4">
		<h3 className="h3">Simple Standards</h3>
		<p className="text-surface-700-300">
			We aim to standardize the design process, providing common conventions that are easy to learn and retain, whether you work alone or in
			a team environment. Covering common fixtures such as themes, colors, typography, spacing, and more.
		</p>
	</div>
	<div className="card preset-outlined-surface-200-800 bg-surface-50-950 p-10 space-y-4">
		<h3 className="h3">Utility-First</h3>
		<p className="text-surface-700-300">
			Skeleton embraces the{' '}
			<a className="anchor" href="https://tailwindcss.com/docs/utility-first" target="_blank" rel="external">
				utility-first
			</a>{' '}
			methodology for styling, supporting all features provided by{' '}
			<a className="anchor" href="https://tailwindcss.com/" target="_blank" rel="external">
				Tailwind
			</a>
			, while extending it's capabilities in meaningful ways. Providing full support for the encapsulated components of the modern web.
		</p>
	</div>
	<div className="card preset-outlined-surface-200-800 bg-surface-50-950 p-10 space-y-4">
		<h3 className="h3">Opt-In by Default</h3>
		<p className="text-surface-700-300">
			Most features in Skeleton are modular and opt-in by default. Enabling interface features like buttons and typography via dedicated
			utility classes. This allows for a simple escape hatch when you need to draw outside the lines and generate custom interfaces.
		</p>
	</div>
	<div className="card preset-outlined-surface-200-800 bg-surface-50-950 p-10 space-y-4">
		<h3 className="h3">Adaptive</h3>
		<p className="text-surface-700-300">
			Skeleton is intended to adapt to the design and aesthetic of your project, while still providing reasonable defaults. Providing a
			powerful{' '}
			<a className="anchor" href="https://themes.skeleton.dev/" target="_blank" rel="external">
				theme generator
			</a>{' '}
			for custom themes, while also supplying a curated set of themes for those less design savvy.
		</p>
	</div>
</div>
}

## Additional Benefits

{

<div className="grid grid-cols-1 md:grid-cols-2 gap-4">

    <div className="col-span-2 card preset-outlined-surface-200-800 bg-surface-50-950 p-10 space-y-4">
    	<h3 className="h3">Functional Components</h3>

    	<p className="text-surface-700-300">
    		Skeleton provides an optional suite of functional components built atop the foundation of <a href="https://zagjs.com/" target="_blank" class="anchor">Zag.js</a>. These components automatically adapt to the Skeleton design system out of the box. We currently support React and Svelte, with plans for other frameworks in the future.
    	</p>
    </div>
    <div className="card preset-outlined-surface-200-800 bg-surface-50-950 p-10 space-y-4">
    	<h3 className="h3">Open Source</h3>

    	<p className="text-surface-700-300">
    		Skeleton is provided as <a href="https://github.com/skeletonlabs/skeleton" target="_blank" class="anchor">free and open-source software (FOSS)</a> under the <a href="https://github.com/skeletonlabs/skeleton?tab=MIT-1-ov-file#readme" target="_blank" class="anchor">MIT License</a>.
    	</p>
    </div>
    <div className="card preset-outlined-surface-200-800 bg-surface-50-950 p-10 space-y-4">
    	<h3 className="h3">The Community</h3>

    	<p className="text-surface-700-300">
    		A huge community of users and contributors across <a href="https://github.com/skeletonlabs/skeleton" target="_blank" class="anchor">GitHub</a>, <a href="https://discord.gg/EXqV7W8MtY" target="_blank" class="anchor">Discord</a>, and <a href="https://bsky.app/profile/skeleton.dev" target="_blank" class="anchor">Bluesky</a>.
    	</p>
    </div>
    <div className="card preset-outlined-surface-200-800 bg-surface-50-950 p-10 space-y-4">
    	<h3 className="h3">Frequent Updates</h3>

    	<p className="text-surface-700-300">
    		Skeleton has maintained a frequent release cadence over for years. Just take a look at our <a href="https://github.com/skeletonlabs/skeleton/blob/dev/packages/skeleton/CHANGELOG.md" target="_blank" class="anchor">changelog</a>.
    	</p>
    </div>
    <div className="card preset-outlined-surface-200-800 bg-surface-50-950 p-10 space-y-4">
    	<h3 className="h3">Figma UI Kit</h3>

    	<p className="text-surface-700-300">
    		Skeleton provides access to a fully featured <a href="/figma" class="anchor">Figma UI Kit</a> to assist designers in drafting a visual concept of upcoming projects.
    	</p>
    </div>

</div>
}

---

## Get Started

### Using Skeleton

Ready to get started? Check out our comprehensive [installation guides](/docs/get-started/installation) and begin [learning the fundamentals](/docs/get-started/fundamentals).

### Contributing

Please refer to our dedicated [Contribution Guidelines](/docs/resources/contribute) if you wish to contribute directly.

---

# Migrate from v2

Learn how to migrate from Skeleton v2 to the latest version.

## Introduction

Version 3 represents a major overhaul to Skeleton. This includes a ground up rewrite of quite literally every feature in the library. We have provided a migration CLI to help automate this process. However, some portions of this migration will still required manual intervention. This is not a trivial migration from prior versions, so please use caution when updating and ensure you follow this guide very carefully.

## Prerequisites

While Skeleton v3 introduces support for multiple frameworks, we’ve historically only supported SvelteKit. As such, this guide is only intended for users migrating from Skeleton v2 and SvelteKit. If you you are coming from another meta-framework, this will be outside the scope of this guide. However, this may still provide a valuable insight to the primary objectives for migration.

### Create a Migration Branch

We recommend you handle all migration changes on a dedicated feature branch. This ensures you can easily drop or revert changes if something goes wrong.

```shell
git checkout -b migration
```

### Prepare Your Skeleton App

Please make sure you have accounted for the following:

- Your app is running the latest release of Skeleton v2.x
- All critical dependencies have been updated (optional but recommended)
- Your app is in a functional state before you proceed

---

## Migrate Core Technologies

Skeleton is built on top of the following technologies. These must be migrated individually before proceeding with the Skeleton-specific migration. Note that Svelte and Tailwind provide dedicated CLIs to automate this process.

### Svelte v5

Migrate to the latest release of Svelte v5.

<figure class="linker bg-noise">
	<a class="btn preset-filled" href="https://svelte.dev/docs/svelte/v5-migration-guide" target="_blank">
		Svelte v5 Migration &rarr;
	</a>
</figure>

### SvelteKit v2

Migrate to the latest release of SvelteKit v2.

<figure class="linker bg-noise">
	<a class="btn preset-filled" href="https://svelte.dev/docs/kit/migrating-to-sveltekit-2" target="_blank">
		SvelteKit v2 Migration &rarr;
	</a>
</figure>

### Tailwind v4

Before migration to tailwind V4 using their upgrade guide some manual steps are required:

1. Remove the `skeleton` plugin from your `tailwind.config` file.
2. Rename your `app.postcss` or `app.pcss` to `app.css`.
3. Remove the `purgecss` (`vite-plugin-tailwind-purgecss`) vite plugin from your `vite.config` (if installed).

Migrate to the latest release of Tailwind v4.

<figure class="linker bg-noise">
	<a class="btn preset-filled" href="https://tailwindcss.com/docs/upgrade-guide" target="_blank">
		Tailwind v4 Migration &rarr;
	</a>
</figure>

---

## Migrate to the Tailwind Vite Plugin

Use the following steps to migrate to from PostCSS to the Vite plugin:

1. Delete `postcss.config.mjs`
2. Run `npm uninstall postcss @tailwindcss/postcss`
3. Run `npm install @tailwindcss/vite`
4. Open your `vite.config` in the root of your project
5. Import the following at the top of the file: `import tailwindcss from '@tailwindcss/vite'`
6. Finally, add the Vite plugin ABOVE your specific framework plugin:

```ts
plugins: [
	tailwindcss(),
	sveltekit(), // or svelte()
];
```

---

## Automated Migration

We’ve provided a dedicated migration script as part of the Skeleton CLI to help automate much of this process.

> TIP: Please ensure you've committed all pending changes before proceeding.

```console
npx skeleton migrate skeleton-3
```

What WILL be migrated...

- Update all required `package.json` dependencies
- Implement all required Skeleton imports in your global stylesheet `app.css`
- Modify `data-theme` in `app.html` if you’re using a Skeleton preset theme.
- Temporarily disable custom theme imports to allow for theme migration.
- Migrate all modified Skeleton utility classes (ex: `variant-*` to `preset-*`)
- Update all Skeleton imports throughout your entire project
- Renames all relevant Skeleton components
- Some Component imports will also be pruned as they are no longer supported. We’ll cover these features in detail below.

What will NOT be migrated...

- Component props will not be updated. Unfortunately there’s too many permutations.
- Most v2 Utility features will not be migrated (ex: popovers, code blocks, etc)

Make sure to consult your local Git Diff to compare what has been modified before progressing forward or committing these automated changes.

---

## Additional Migration

With automated migration complete, please follow the remaining manual migration steps.

### Migrate Themes

#### For Preset Themes

Your preset theme should be automatically migrated by the CLI, you're all set!

#### For Custom Themes

1. Use the [Import feature](https://themes.skeleton.dev/themes/import) provided by the new Theme Generator.
2. Drag and Drop your v2 theme into the file upload field.
3. Your theme will be automatically converted to the newest format.
4. Update and modify any theme settings in the live preview.
5. Make sure to set a valid theme name in the right-hand panel.
6. Tap the “Code” tab to preview your generated theme code.
7. Copy the theme code, then following our [custom theme instructions](/docs/design/themes#custom-themes).
8. Similar to preset themes, you will need to both register and set an active theme.

### Replace AppShell with Custom Layouts

Skeleton has sunset the ([troublesome](https://github.com/skeletonlabs/skeleton/issues/2383)) `<AppShell>` component in favor of user-defined custom layouts. We've provided a [Layouts](/docs/guides/layouts) guide for replicating common page structures using only semantic HTML and Tailwind - no Skeleton specific features needed!

### Migrating Components

Components have undergone the biggest update in Skeleton v3. Given the sheer number of changes, we recommend you compare each component to it's equivalent v3 documentation. We’ve highlighted a few of the key changes below:

- Changes to adopt the new [Svelte 5 APIs](https://svelte.dev/docs/svelte/v5-migration-guide) like runes, snippets, event handlers, etc.
- Changes to support [Zag.js](https://zagjs.com/), which serves as a foundation of our cross-framework components.
- Changes to the import path: `@skeletonlabs/skeleton-svelte`.
- Changes to the component name and/or structure (including sub-components)
- Changes based on newly introduces features and properties.
- Changes to adopt the new [style prop conventions](/docs/get-started/fundamentals#style-props) and cross-framework standardization.

Here's an example of changes for a single component from v2 to the new equivalent:

```svelte
<!-- Skeleton v2 -->

<script lang="ts">
	import { RangeSlider } from '@skeletonlabs/skeleton';
	let value = 15;
</script>

<RangeSlider name="amount" bind:value ticked />
```

```svelte
<!-- Skeleton v3 -->

<script lang="ts">
	import { Slider } from '@skeletonlabs/skeleton-svelte';
	let value = $state([15]);
</script>

<Slider name="amount" {value} onValueChange={(e) => (value = e.value)} markers={[25, 50, 75]} />
```

We’ve denoted the most notable changes to each component in the table below:

| Name               | v2                                                          | v3                                            | Notes                                                                                                        |
| ------------------ | ----------------------------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `<AppRail>`        | [Link](https://v2.skeleton.dev/components/app-rail)         | [Link](/docs/components/navigation/svelte)    | Renamed `<Navigation>` - greatly expanded features                                                           |
| `<FileButton>`     | [Link](https://v2.skeleton.dev/components/file-buttons)     | [Link](/docs/components/file-upload/svelte)   | Renamed `<FileUpload>` - merges `<FileDropzone>` features                                                    |
| `<FileDropzone>`   | [Link](https://v2.skeleton.dev/components/file-buttons)     | [Link](/docs/components/file-upload/svelte)   | Renamed `<FileUpload>` - merges `<FileButton>` features                                                      |
| `<InputChip>`      | [Link](https://v2.skeleton.dev/components/input-chips)      | [Link](/docs/components/tags-input/svelte)    | Renamed `<TagsInput>`                                                                                        |
| `<Paginator>`      | [Link](https://v2.skeleton.dev/components/paginators)       | [Link](/docs/components/pagination/svelte)    | Renamed `<Pagination>`                                                                                       |
| `<ProgressBar>`    | [Link](https://v2.skeleton.dev/components/progress-bars)    | [Link](/docs/components/progress/svelte)      | Renamed `<Progress>`                                                                                         |
| `<ProgressRadial>` | [Link](https://v2.skeleton.dev/components/progress-radials) | [Link](/docs/components/progress-ring/svelte) | Renamed `<ProgressRing>`                                                                                     |
| `<RadioGroup>`     | [Link](https://v2.skeleton.dev/components/radio-groups)     | [Link](/docs/components/segment/svelte)       | Renamed `<Segment>` (aka Segmented Control)                                                                  |
| `<RangeSlider>`    | [Link](https://v2.skeleton.dev/components/range-sliders)    | [Link](/docs/components/slider/svelte)        | Renamed `<Slider>`                                                                                           |
| `<SlideToggle>`    | [Link](https://v2.skeleton.dev/components/slide-toggles)    | [Link](/docs/components/switch/svelte)        | Renamed `<Switch>`                                                                                           |
| `<TabGroup>`       | [Link](https://v2.skeleton.dev/components/tabs)             | [Link](/docs/components/tabs/svelte)          | Renamed `<Tabs>`                                                                                             |
| `<TreeView>`       | [Link](https://v2.skeleton.dev/components/tree-views)       | --                                            | Coming soon - [Track progress](https://github.com/skeletonlabs/skeleton/issues/2358#issuecomment-2313215789) |

### Tailwind v4 Changes

Taliwind v4 represents a major update for Tailwind. We've detailed the most notable features as they may relate to your Skeleton project. Please consult the [Tailwind v4 announcement](https://tailwindcss.com/blog/tailwindcss-v4) post for the full roster of changes.

- The `tailwing.config` has been removed in favor of [CSS-base configuration](https://tailwindcss.com/blog/tailwindcss-v4#css-first-configuration) in your global stylesheet.
- Make sure you’re using the newest strategies for supporting [Dark Mode](/docs/guides/mode).
- You are still required to implement the [Tailwind Forms Plugin](/docs/tailwind/forms#prerequisites) to use Skeleton form elements.
- The Skeleton `data-theme` attribute has moved from `<body>` to `<html>`
- Themes colors are now stored in the [oklch format](https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl), but optionally support any format.

### Replace Unsupported Features

Skeleton v3 represents a point of reflection on what features should remain as part of the core experience. As such, we've identified a number of features that fall outside of this scope. Don't fret though, we've gone out of our way to detail each feature and provide the best alternative available.

#### Svelte Actions

| Name       | v2                                                 | Alternative                               | Notes                          |
| ---------- | -------------------------------------------------- | ----------------------------------------- | ------------------------------ |
| Clipboard  | [Link](https://v2.skeleton.dev/actions/clipboard)  | [Link](/docs/guides/cookbook/clipboard)   | Provided via Cookbook guide    |
| SVG Filter | [Link](https://v2.skeleton.dev/actions/filters)    | [Link](/docs/guides/cookbook/svg-filters) | Provided via Cookbook guide    |
| Focus Trap | [Link](https://v2.skeleton.dev/actions/focus-trap) | [Link](/docs/integrations/popover/svelte) | Provided via Integration guide |

> TIP: We also recommend [Runed](https://runed.dev/docs) for a similar approach to small composable features for Svelte 5.

#### Components

| Name              | v2                                                              | Alternative                                                                    | Notes                                    |
| ----------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------ | ---------------------------------------- |
| `<AppShell>`      | [Link](https://v2.skeleton.dev/components/app-shell)            | [Link](/docs/guides/layouts)                                                   | Replaced with custom layouts             |
| `<Autocomplete>`  | [Link](https://v2.skeleton.dev/components/autocomplete)         | [Link](/docs/integrations/popover/svelte#combobox)                             | Provided via Integration guide           |
| `<ConicGradient>` | [Link](https://v2.skeleton.dev/components/conic-gradients)      | [Link](https://tailwindcss.com/docs/background-image#adding-a-radial-gradient) | Now built into Tailwind                  |
| `<Lightswitch>`   | [Link](https://v2.skeleton.dev/docs/dark-mode#custom-component) | [Link](/docs/guides/mode#lightswitch)                                          | Removed in favor of custom components    |
| `<ListBox>`       | [Link](https://v2.skeleton.dev/components/listboxes)            | --                                                                             | Removed                                  |
| `<Stepper>`       | [Link](https://v2.skeleton.dev/components/steppers)             | [Link](/docs/guides/cookbook/stepper)                                          | Provided via Cookbook guide              |
| `<Table>`         | [Link](https://v2.skeleton.dev/components/tables)               | [Link](/docs/tailwind/tables)                                                  | Removed in favor of a Tailwind component |

#### Utilities

| Name              | v2                                                             | Alternative                                       | Notes                          |
| ----------------- | -------------------------------------------------------------- | ------------------------------------------------- | ------------------------------ |
| Code Blocks       | [Link](https://v2.skeleton.dev/utilities/codeblocks)           | [Link](/docs/integrations/code-block/svelte)      | Provided via Integration guide |
| Drawers           | [Link](https://v2.skeleton.dev/utilities/drawers)              | [Link](/docs/integrations/popover/svelte#modal)   | Provided via Integration guide |
| Modals            | [Link](https://v2.skeleton.dev/utilities/modals)               | [Link](/docs/integrations/popover/svelte#modal)   | Provided via Integration guide |
| Popovers          | [Link](https://v2.skeleton.dev/utilities/popovers)             | [Link](/docs/integrations/popover/svelte#popover) | Provided via Integration guide |
| Toasts            | [Link](https://v2.skeleton.dev/utilities/toasts)               | [Link](/docs/integrations/toasts/svelte)          | Provided via Integration guide |
| Table of Contents | [Link](https://v2.skeleton.dev/utilities/table-of-contents)    | [Link](/docs/guides/cookbook/table-of-contents)   | Provided via Cookbook guide    |
| Persisted Store   | [Link](https://v2.skeleton.dev/utilities/local-storage-stores) | --                                                | Incompatable with Svelte 5     |

#### Popovers and Modals

Members of the both the Skeleton team and the Svelte community are actively building [Floating UI Svelte](https://floating-ui-svelte.vercel.app/). The long term goal is to use this as a best-in-class solution for: popovers, tooltips, modals, drawers, and more. Until then, we are providing a [select set of components](/docs/integrations/popover/svelte), powered by Zag.js, to help bridge the gap. These components will be supported for the full duration of Skeleton v3.x. However, they will be replaced with a dedicated guide ([similar to React](/docs/integrations/popover/react)) in the future. We ask that you please be patient during this transitory phase.

### Migration Complete

If you’ve completed all steps above in full, your application should once again be in a function state. Run your application's local dev server to confirm, and remember to merge all changes into your primary branch.

```shell
npm run dev
```

---

## Troubleshooting

If you’re receiving errors, they may indicate components or features that require additional manual migration on your part. Use each error to identify the location of the feature and make any required changes. Consult each component’s documentation for the most current usage examples and API reference. In many cases this may just involve adding/removing/renaming a prop.

## Reporting Issues

If you get stuck or need to report an issue with either Skeleton v3 or this migration guide, please reach out via either the Skeleton [GitHub](https://github.com/skeletonlabs/skeleton/) or [Discord](https://discord.gg/EXqV7W8MtY) support channels.

---

## Installation

# Astro

Install and configure Skeleton for Astro.

## Requirements

| Tooling                              | Minimum Supported |
| ------------------------------------ | ----------------- |
| [Astro](https://vite.dev/)           | 5                 |
| [React](https://react.dev/)          | 18                |
| [Svelte](https://svelte.dev/)        | 5                 |
| [Tailwind](https://tailwindcss.com/) | 4                 |

## Installation

Learn how to install the Skeleton core into your Astro project. We'll cover using components in the section below.

<Process>
    <ProcessStep step="1">
        ### Create a Project
        Start by creating a new Astro project. We recommend selecting all default options.
        ```console
        npm create astro@latest --add tailwind my-skeleton-app
		cd my-skeleton-app
        ```
    </ProcessStep>
    <ProcessStep step="2">
        ### Install Skeleton
        Install the Skeleton core package for the Tailwind plugin.
        ```console
        npm i -D @skeletonlabs/skeleton
        ```
    </ProcessStep>
    <ProcessStep step="3">
        ### Configure Tailwind
      	Create a global styleshseet in `/src/styles/global.css` and add import the following.
         ```css title="global.css"
        @import 'tailwindcss';

        @import '@skeletonlabs/skeleton';
        @import '@skeletonlabs/skeleton/optional/presets';
        @import '@skeletonlabs/skeleton/themes/cerberus';
        ```
    </ProcessStep>
    <ProcessStep step="4">
        ### Remove Default Content and Styles
        We recommend you open `/src/components/welcome.astro` and remove all default HTML and CSS. Here's a simple starter layout.
        ```astro
       ---
    	const framework = 'Astro';
    	import '../styles/global.css'
    	---
    	<main class="p-10 space-y-4">
    		<h1 class="h1">Hello {framework}</h1>
    		<p>This page is working.</p>
    		<button type="button" class="btn preset-filled-primary-500">Example Button</button>
    	</main>
    	```
    </ProcessStep>
    <ProcessStep step="5">
        ### Set Active Theme
        Open `/src/layouts/Layout.astro`, then set the `data-theme` attribute on the HTML tag to define the active theme.
        ```html title="layouts/Layout.astro" "data-theme="cerberus""
        <html data-theme="cerberus">...</html>
        ```
    </ProcessStep>
    <ProcessStep step="check">
        ### Run the Project
        Start the dev server using the following command.
    	```console
    	npm run dev
        ```
    </ProcessStep>

</Process>

## Using Components in Astro

While Astro can support [multiple Frontend frameworks](https://docs.astro.build/en/guides/integrations-guide/), please be aware this comes with some notable restrictions:

- With the exception of this [experimental React flag](https://docs.astro.build/en/guides/integrations-guide/react/#children-parsing), components cannot utilize slotted content in `.astro` files.
- You will need to install additional packages for both Astro and Skeleton per your framework of choice.
- You may need a _wrapper_ component to use to utilize all component feature. We'll demo this below.

<Process>
	<ProcessStep step="1">
        ### Astro Framework Packages
        Install only the Astro framework(s) packages you intend to use.
        ```console
        npx astro add react
        ```
		https://docs.astro.build/en/guides/integrations-guide/react/
        ```console
		npx astro add svelte
        ```
		https://docs.astro.build/en/guides/integrations-guide/svelte/
    </ProcessStep>
	<ProcessStep step="2">
        ### Skeleton Framework Packages
        Install only the Skeleton framework(s) packages you intend to use.
        ```console
       	@skeletonlabs/skeleton-react
        ```
        ```console
		@skeletonlabs/skeleton-svelte
        ```
    </ProcessStep>
	<ProcessStep step="3">
        ### Add Source Path to CSS Config
        Open your global stylesheet in `/src/styles/global.css` and insert each required `@source`. These should come immediately before Skeleton imports.
        ```css
		@source '../../node_modules/@skeletonlabs/skeleton-react/dist';
        ```
        ```css
		@source '../../node_modules/@skeletonlabs/skeleton-svelte/dist';
        ```
		> NOTE: please verify the `@source` path resolves to your `node_modules` directory.
    </ProcessStep>
	<ProcessStep step="4">
        ### Using Wrapper Components
        In most cases, frontend framework components may not be fully functional if used directly within `.astro` files. To overcome this, you may utilize a wrapper component of that framework. Here's a demo using the Skeleton Avatar component as an example.
		#### React
		```tsx title="ReactAvatarWrapper.tsx"
		import React from 'react';
		import { Avatar } from '@skeletonlabs/skeleton-react';

    	export const ReactAvatarWrapper: React.FC = () => {
    		const imgSrc = '...';
    		return <Avatar src={imgSrc} name="skeleton" />;
    	};
    	```
    	```astro title="page.astro"
    	---
    	import { ReactAvatarWrapper } from '@components/ReactAvatarWrapper';
    	---

    	<ReactAvatarWrapper />
    	```
    	#### Svelte
    	```svelte title="SvelteAvatarWrapper.svelte"
    	<script lang="ts">
    	import { Avatar } from '@skeletonlabs/skeleton-svelte';
    	const imgSrc = '...';
    	</script>

    	<Avatar src={imgSrc} name="skeleton" />
    	```
    	```astro title="page.astro"
    	---
    	import { SvelteAvatarWrapper } from '@components/SvelteAvatarWrapper';
    	---

    	<SvelteAvatarWrapper />
    	```
    </ProcessStep>
    <ProcessStep step="check">
        ### Run the Project
        Start the dev server using the following command.
    	```console
    	npm run dev
        ```
    </ProcessStep>

</Process>

---

# Next.js

Install and configure Skeleton for Next.js.

## Requirements

| Tooling                              | Minimum Supported |
| ------------------------------------ | ----------------- |
| [Next.js](https://nextjs.org/)       | 15                |
| [React](https://react.dev/)          | 18                |
| [Tailwind](https://tailwindcss.com/) | 4                 |

## Installation

<Process>
    <ProcessStep step="1">
        ### Create a Project
        Use the [Next.js CLI](https://nextjs.org/docs/app/getting-started/installation) to scaffold a new project.
        ```console
        npm create next-app@latest my-skeleton-app 
        cd my-skeleton-app
        ```
    </ProcessStep>
    <ProcessStep step="2">
        ### Install Skeleton
        Install the Skeleton core and React component packages.
        ```console
        npm i -D @skeletonlabs/skeleton @skeletonlabs/skeleton-react
        ```
    </ProcessStep>
    <ProcessStep step="4">
        ### Configure Tailwind
        Open your global stylesheet in `/src/app/globals.css` and add the following imports:
        ```css title="globals.css" {3-7}
        @import 'tailwindcss';

        @import '@skeletonlabs/skeleton';
        @import '@skeletonlabs/skeleton/optional/presets';
        @import '@skeletonlabs/skeleton/themes/cerberus';

        @source '../../node_modules/@skeletonlabs/skeleton-react/dist';
        ```
    	> NOTE: make sure the `@source` path resolves correctly for your application structure.
    </ProcessStep>
    <ProcessStep step="5">
        ### Set Active Theme
        Open `/src/app/layout.tsx`, then set the `data-theme` attribute on the HTML tag to define the active theme.
        ```html title="layout.tsx" "data-theme="cerberus""
        <html data-theme="cerberus">...</html>
        ```
    </ProcessStep>
    <ProcessStep step="check">
        ### Done
        Start the dev server using the following command.
    	```console
        npm run dev
        ```
    </ProcessStep>

</Process>

---

# Other Frameworks

Install Skeleton for other frameworks.

## Requirements

Skeleton's [Core Package](/docs/get-started/core-api) is framework agnostic, meaning many of the Design System and Tailwind-centric features can used on any number of frameworks. This includes everything _except_ components. In order to install Skeleton for additional framework, your app must be able to support the following:

| Tooling                              | Minimum Supported     |
| ------------------------------------ | --------------------- |
| Package Management                   | NPM, PNPM, Yarn, etc. |
| [Tailwind](https://tailwindcss.com/) | 4                     |

The exact instructions for installing Skeleton will differ per framework, however we've provided a general guidance below. Use this as a foundation for getting started in any number of unofficially supported frameworks.

## Installation

<Process>
    <ProcessStep step="1">
        ### Create a Project
        Scaffold your web-based application using any framework (such as [Nuxt](https://nuxt.com/), [SolidStart](https://start.solidjs.com/), [Laravel](https://laravel.com/), etc.)
    </ProcessStep>
    <ProcessStep step="2">
        ### Install Tailwind
		Refer to the [official instructions](https://tailwindcss.com/docs/installation/framework-guides) for installing Tailwind on your framework of choice.
    </ProcessStep>
    <ProcessStep step="3">
        ### Install Skeleton
        Install the Skeleton core package to gain access to most features - excluding Components.
        ```console
        npm i -D @skeletonlabs/skeleton
        ```
    </ProcessStep>
    <ProcessStep step="4">
        ### Configure Tailwind
        Locate your global stylesheet and append the following at the top of the file.
        ```css {3-5}
        @import 'tailwindcss';

        @import '@skeletonlabs/skeleton';
        @import '@skeletonlabs/skeleton/optional/presets';
        @import '@skeletonlabs/skeleton/themes/cerberus';
        ```
    </ProcessStep>
    <ProcessStep step="6">
        ### Set Active Theme
        Open the file containing the `<html>` tag for your project and set the `data-theme` attribute as follows.
        ```html "data-theme="cerberus""
        <html data-theme="cerberus">
            ...
        </html>
        ```
    </ProcessStep>
    <ProcessStep step="check">
        ### Run the Project
        Start the dev server for your framework of choice.
    </ProcessStep>

</Process>

## Support

While we officially limit support for Skeleton to React, Svelte, and Astro for now, Skeleton has an active community of users on [GitHub](https://github.com/skeletonlabs/skeleton/discussions) and [Discord](https://discord.gg/EXqV7W8MtY). If you need support (directly related to Skeleton) considering reaching out in these spaces. Other members of the community may be able to assist you.

---

# SvelteKit

Install and configure Skeleton for SvelteKit.

## Requirements

| Tooling                              | Minimum Supported |
| ------------------------------------ | ----------------- |
| [SvelteKit](https://svelte.dev/)     | 2                 |
| [Svelte](https://svelte.dev/)        | 5                 |
| [Tailwind](https://tailwindcss.com/) | 4                 |

## Installation

<Process>
    <ProcessStep step="1">
        ### Create a Project
        Use the [Svelte CLI](https://svelte.dev/docs/kit/creating-a-project) to generate a new SvelteKit project.
        ```console
        npx sv create --types ts my-skeleton-app
		cd my-skeleton-app
        ```
		> NOTE: If you did not select the options to add Tailwind, use `npx sv add tailwindcss` to add it retroactively.
    </ProcessStep>
    <ProcessStep step="2">
        ### Install Skeleton
        Install the Skeleton core and Svelte component packages.
        ```console
        npm i -D @skeletonlabs/skeleton @skeletonlabs/skeleton-svelte
        ```
    </ProcessStep>
    <ProcessStep step="3">
		### Configure Tailwind
        Open your global stylesheet in `/src/app.css` and add the following imports:
        ```css title="app.css" {3-7}
        @import 'tailwindcss';

        @import '@skeletonlabs/skeleton';
        @import '@skeletonlabs/skeleton/optional/presets';
        @import '@skeletonlabs/skeleton/themes/cerberus';

        @source '../node_modules/@skeletonlabs/skeleton-svelte/dist';
        ```
    	> NOTE: please verify the `@source` path resolves to your `node_modules` directory.
    </ProcessStep>
    <ProcessStep step="4">
        ### Set Active Theme
        Open `/src/app.html`, then set the `data-theme` attribute on the HTML tag to define the active theme.
        ```html title="app.html" "data-theme="cerberus""
        <html data-theme="cerberus">...</html>
        ```
    </ProcessStep>
    <ProcessStep step="check">
        ### Done
        Start the dev server using the following command.
    	```console
        npm run dev
        ```
    </ProcessStep>

</Process>

---

# Vite + React

Install and configure Skeleton for Vite + React.

## Requirements

| Tooling                              | Minimum Supported |
| ------------------------------------ | ----------------- |
| [Vite](https://vite.dev/)            | 6                 |
| [React](https://react.dev/)          | 18                |
| [Tailwind](https://tailwindcss.com/) | 4                 |

## Installation

<Process>
    <ProcessStep step="1">
        ### Create a Project
        Start by creating a new [Vite](https://vite.dev/guide/#scaffolding-your-first-vite-project) project. This will install React and Typescript.
        ```console
        npm create vite@latest --template react-ts my-skeleton-app
		cd my-skeleton-app
		npm install
        ```
    </ProcessStep>
    <ProcessStep step="2">
       ### Install Skeleton
        Install the Skeleton core and React component packages.
        ```console
        npm i -D @skeletonlabs/skeleton @skeletonlabs/skeleton-react
        ```
    </ProcessStep>
    <ProcessStep step="3">
        ### Install Tailwind
        Install Tailwind and and the Tailwind Vite plugin.
        ```console
        npm install tailwindcss @tailwindcss/vite
        ```
		Implement the plugin in `vite.config` in the root of your project.
		```ts title="vite.config" {3} "tailwindcss()"
		import { defineConfig } from "vite";
		import react from "@vitejs/plugin-react";
		import tailwindcss from "@tailwindcss/vite";

    	export default defineConfig({
    		plugins: [
    			tailwindcss(),
    			react() // <-- Must come after Tailwind
    		],
    	});
    	```
    </ProcessStep>
    <ProcessStep step="4">
        ### Configure Tailwind
       	Open your global styleshset in `/src/index.css` and append the following at the top of the file.
         ```css title="index.css"
        @import 'tailwindcss';

        @import '@skeletonlabs/skeleton';
        @import '@skeletonlabs/skeleton/optional/presets';
        @import '@skeletonlabs/skeleton/themes/cerberus';

        @source '../node_modules/@skeletonlabs/skeleton-react/dist';
        ```
    	> NOTE: please verify the `@source` path resolves to your `node_modules` directory.
    </ProcessStep>
    <ProcessStep step="5">
        ### Set the Active Theme
        Open `index.html`, then set the `data-theme` attribute on the HTML tag to define the active theme.

        ```html title="index.html" "data-theme="cerberus""
        <html data-theme="cerberus">...</html>
        ```
    </ProcessStep>
    <ProcessStep step="check">
        ### Done
        Start the dev server using the following command.
    	```console
        npm run dev
        ```
    </ProcessStep>

</Process>

---

# Vite + Svelte

Install and configure Skeleton for Vite + Svelte.

## Requirements

| Tooling                              | Minimum Supported |
| ------------------------------------ | ----------------- |
| [Vite](https://vite.dev/)            | 6                 |
| [Svelte](https://svelte.dev/)        | 5                 |
| [Tailwind](https://tailwindcss.com/) | 4                 |

## Installation

<Process>
    <ProcessStep step="1">
        ### Create a Project
        Start by creating a new [Vite](https://vite.dev/guide/#scaffolding-your-first-vite-project) project. This will install Svelte and Typescript.
        ```console
        npm create vite@latest --template svelte-ts my-skeleton-app
		cd my-skeleton-app
		npm install
        ```
    </ProcessStep>
    <ProcessStep step="2">
       ### Install Skeleton
        Install the Skeleton core and Svelte component packages.
        ```console
        npm i -D @skeletonlabs/skeleton @skeletonlabs/skeleton-svelte
        ```
    </ProcessStep>
    <ProcessStep step="3">
        ### Install Tailwind
        Install Tailwind and and the Tailwind Vite plugin.
        ```console
        npm install tailwindcss @tailwindcss/vite
        ```
		Implement the plugin in `vite.config` in the root of your project.
		```ts title="vite.config" {3} "tailwindcss()"
		import { defineConfig } from "vite";
		import svelte from "@vitejs/plugin-svelte";
		import tailwindcss from "@tailwindcss/vite";

    	export default defineConfig({
    		plugins: [
    			tailwindcss(),
    			svelte() // <-- Must come after Tailwind
    		],
    	});
    	```
    </ProcessStep>
    <ProcessStep step="4">
        ### Configure Tailwind
    	Open your global styleshset in `/src/app.css` and append the following at the top of the file.
         ```css title="app.css"
        @import 'tailwindcss';

        @import '@skeletonlabs/skeleton';
        @import '@skeletonlabs/skeleton/optional/presets';
        @import '@skeletonlabs/skeleton/themes/cerberus';

        @source '../node_modules/@skeletonlabs/skeleton-svelte/dist';
        ```
    	> NOTE: please verify the `@source` path resolves to your `node_modules` directory.
    </ProcessStep>
    <ProcessStep step="5">
        ### Set the Active Theme
        Open `index.html`, then set the `data-theme` attribute on the HTML tag to define the active theme.
        ```html title="index.html" "data-theme="cerberus""
        <html data-theme="cerberus">...</html>
        ```
    </ProcessStep>
    <ProcessStep step="check">
        ### Done
        Start the dev server using the following command.
    	```console
        npm run dev
        ```
    </ProcessStep>

</Process>

---

# Guides

# Cookbook

A collection of recipes for crafting interface features that utilize Skeleton primitives.

## What's This?

Learn how [recipes](https://bigmedium.com/ideas/the-art-of-design-system-recipes.html) can help you augment and expand the Skeleton design system.

## Browse

<TableCookbook />

---

# Figma UI kit

Welcome to the Skeleton Figma Design System Tutorials!

{

<p class="text-2xl">
	Explore step-by-step guides to unlock the full potential of Skeleton in your design workflow. Whether you're setting up for the first time
	or mastering advanced features, these tutorials will guide you every step of the way.
</p>
}

## Get Access

Review the benefits of the Figma UI Kit for Skeleton.

<figure class="linker bg-noise">
	<a class="btn preset-filled" href="/figma#get-access" target="_blank">
		Get the Figma UI Kit &rarr;
	</a>
</figure>

## Guides

Follow along with our step-by-step guides.

<NavGrid collection="docs" path="figma/" classes="md:grid-cols-1" />

---

# Layouts

Learn best practices for creating responsive layouts using semantic HTML and Tailwind.

<p class="text-xl">
	Skeleton supports a variety of web-based frameworks and meta-frameworks, and this guide serves as a universal reference when implementing
	page layouts. These techniques utilize native HTML and Tailwind, meaning Skeleton is supported but not required. The only prerequisite is
	Tailwind itself.
</p>

## Real World Example

See our real world three column example, which implements many of the concepts introduced below.

<figure class="linker bg-noise">
	<a class="btn preset-filled" href="https://play.tailwindcss.com/zP9RcoacIS" target="_blank">
		View Real World Example
	</a>
</figure>

## Semantic Markup

When creating custom layouts, it's recommended to use semantic HTML to denote each region of the page.

| Element     | Description                                                                                                                                                                                                                                                                                                                                                                       | Source                                                                   |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `<header>`  | Represents introductory content, typically a group of introductory or navigational aids. It may contain some heading elements but also a logo, a search form, an author name, and other elements.                                                                                                                                                                                 | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/header)  |
| `<main>`    | Represents the dominant content within the document `<body>`. The main content area consists of content that is directly related to or expands upon the central topic of a document, or the central functionality of an application.                                                                                                                                              | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/main)    |
| `<footer>`  | Represents a footer for its nearest ancestor sectioning content or sectioning root element. Typically contains information about the author of the section, copyright data or links to related documents.                                                                                                                                                                         | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/footer)  |
| `<aside>`   | Represents a portion of a document whose content is only indirectly related to the document's main content. Asides are frequently presented as sidebars or call-out boxes.                                                                                                                                                                                                        | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/aside)   |
| `<article>` | Represents a self-contained composition in a document, page, application, or site, which is intended to be independently distributable or reusable (e.g., in syndication). Examples include: a forum post, a magazine or newspaper article, or a blog entry, a product card, a user-submitted comment, an interactive widget or gadget, or any other independent item of content. | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/article) |

## Using Body Scroll

Prioritize the `<body>` element as the scrollable page element over child elements. Otherwise you risk the following pitfalls:

1. Mobile browser's "pull to refresh" feature will not work as expected.
2. The Mobile Safari's browser interface will not auto-hide when scrolling vertically.
3. CSS print styles may not work as expected.
4. Accessibility may be adversely affected, especially on touch screen devices.
5. May introduce inconsistent behavior between your app framework's layout solution.

## Tailwind Utilities

Tailwind provides several utility classes that may be helpful when generating custom layouts.

### Grid

Learn more about [CSS grid](https://css-tricks.com/snippets/css/complete-guide-grid/).

| Utility                                                        | Description                                                                      |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| [Columns](https://tailwindcss.com/docs/grid-template-columns)  | Utilities for specifying the columns in a grid layout.                           |
| [Column Start/End](https://tailwindcss.com/docs/grid-column)   | Utilities for controlling how elements are sized and placed across grid columns. |
| [Rows](https://tailwindcss.com/docs/grid-template-rows)        | Utilities for specifying the rows in a grid layout.                              |
| [Row Start/End](https://tailwindcss.com/docs/grid-row)         | Utilities for controlling how elements are sized and placed across grid rows.    |
| [Auto Flow](https://tailwindcss.com/docs/grid-auto-flow)       | Utilities for controlling how elements in a grid are auto-placed.                |
| [Auto Columns](https://tailwindcss.com/docs/grid-auto-columns) | Utilities for controlling the size of implicitly-created grid columns.           |
| [Auto Rows](https://tailwindcss.com/docs/grid-auto-rows)       | Utilities for controlling the size of implicitly-created grid rows.              |
| [Gap](https://tailwindcss.com/docs/gap)                        | Utilities for controlling gutters between grid and flexbox items.                |

### Alignment

The following options are available for both [Flexbox](https://css-tricks.com/snippets/css/a-guide-to-flexbox/) and [Grid](https://css-tricks.com/snippets/css/complete-guide-grid/) styles.

| Utility                                                         | Description                                                                                                   |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| [Justify Content](https://tailwindcss.com/docs/justify-content) | Utilities for controlling how flex and grid items are positioned along a container's main axis.               |
| [Justify Items](https://tailwindcss.com/docs/justify-items)     | Utilities for controlling how grid items are aligned along their inline axis.                                 |
| [Justify Self](https://tailwindcss.com/docs/justify-self)       | Utilities for controlling how an individual grid item is aligned along its inline axis.                       |
| [Align Content](https://tailwindcss.com/docs/align-content)     | Utilities for controlling how rows are positioned in multi-row flex and grid containers.                      |
| [Align Items](https://tailwindcss.com/docs/align-items)         | Utilities for controlling how flex and grid items are positioned along a container's cross axis.              |
| [Align Self](https://tailwindcss.com/docs/align-self)           | Utilities for controlling how an individual flex or grid item is positioned along its container's cross axis. |
| [Place Content](https://tailwindcss.com/docs/place-content)     | Utilities for controlling how content is justified and aligned at the same time.                              |
| [Place Items](https://tailwindcss.com/docs/place-items)         | Utilities for controlling how items are justified and aligned at the same time.                               |
| [Place Self](https://tailwindcss.com/docs/place-self)           | Utilities for controlling how an individual item is justified and aligned at the same time.                   |

### Responsive Design

We recommend you utilize Tailwind's built-in [responsive breakpoints](https://tailwindcss.com/docs/responsive-design) for handling responsive design.

```html
<!-- Use a single column on small screens; show multiple columns at the medium breakpoint or wider -->
<div class="grid grid-cols-1 md:grid-cols-[auto_1fr]">
	<!-- Hide the sidebar on small screens; show at the medium breakpoint or wider -->
	<aside class="hidden md:block">(sidebar)</aside>
	<!-- Remains visible at all breakpoints -->
	<main>(main)</main>
</div>
```

By default, your `<html>` and `<body>` may collapse vertically and not extend to full height of the viewport. Consider a reset:

```css
html,
body {
	@apply h-full;
}
```

## The Basics

Let's start by creating traditional layouts using a combination of semantic HTML and Tailwind utility classes.

### One Column

<ExampleColOne />

<figure class="linker bg-noise">
	<a class="btn preset-filled" href="https://play.tailwindcss.com/3ayrvPnIC4" target="_blank">
		Preview and Source
	</a>
</figure>

### Two Column

<ExampleColTwo />

<figure class="linker bg-noise">
	<a class="btn preset-filled" href="https://play.tailwindcss.com/yCv0ZOICSx" target="_blank">
		Preview and Source
	</a>
</figure>

### Three Column

<ExampleColThree />

<figure class="linker bg-noise">
	<a class="btn preset-filled" href="https://play.tailwindcss.com/BH0iosKxix" target="_blank">
		Preview and Source
	</a>
</figure>

## Sticky Positioning

If you wish for your header or sidebar to remain fixed while scrolling, try the following techniques.

### Sticky Header

For `<header>`, we'll implement a few specific utility classes:

- [sticky](https://tailwindcss.com/docs/position#sticky-positioning-elements) - Sets the CSS display to a value of sticky.
- [top-0](https://tailwindcss.com/docs/top-right-bottom-left) - Sets the top offset to a value of 0px.
- [z-10](https://tailwindcss.com/docs/z-index) - Sets the z-index stacking to a value of 10.

> TIP: Use [backdrop-blur](https://tailwindcss.com/docs/backdrop-blur) to produce the hazy glass-like effect for overlapped semi-transparent elements.

<ExampleStickyHeader />

<figure class="linker bg-noise">
	<a class="btn preset-filled" href="https://play.tailwindcss.com/g7ory5pA4K" target="_blank">
		Preview and Source
	</a>
</figure>

### Sticky Sidebar

For `<aside>`, we introduce two addition utility classes:

- [col-span-1](https://tailwindcss.com/docs/grid-column) - we must define our columns explicitly to ensure all styles are display as expected.
- [h-screen](https://tailwindcss.com/docs/height#viewport-height) - ensures our sidebar matches the viewport height. See Calculate Offsets below for more complex layouts.

<figure class="linker bg-noise">
	<a class="btn preset-filled" href="https://play.tailwindcss.com/aSzgim96nc" target="_blank">
		Preview and Source
	</a>
</figure>

## Advanced Techniques

### Calculate Offsets

You may use the [calc](https://developer.mozilla.org/en-US/docs/Web/CSS/calc) property to calculate numeric amounts, which can be handy when you have multiple sticky elements.

```html
<aside class="sticky top-0 h-[calc(100vh-100px)] ...">(sidebar)</aside>
```

1. Sets the `height` value using an arbitrary syntax
2. The initial value is set to 100vh (100% of the viewport height)
3. Finally we subtract the offset for our header (ex: 100px)

### Smart Grid Rows

Combine the grid arbitrary syntax with [minmax](https://developer.mozilla.org/en-US/docs/Web/CSS/minmax) to dynamically set a min and max range for your columns or rows. This is useful when creating a three column layout that need to adhere to a max container width.

```html
<div class="container mx-auto grid grid-cols-[200px_minmax(0px,_1fr)_300px]">
	<aside>(sidebar)</aside>
	<main>(main)</main>
	<aside>(sidebar)</aside>
</div>
```

### Grid Template

If you wish to go beyond Tailwind, native CSS also offers [grid-template](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template). This provides a declarative shorthand for defining grid columns, rows, and areas. Take care to match your [media query breakpoints](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_media_queries/Using_media_queries) configured by Tailwind by default, or extended within your application's [Tailwind configuration](https://tailwindcss.com/docs/responsive-design).

---

# Dark Mode

Learn how to use Tailwind's dark mode feature for your Skeleton project.

{

<p class="text-xl">
	Skeleton makes use of{' '}
	<a className="anchor" href="https://tailwindcss.com/docs/dark-mode" target="_blank" rel="external">
		Tailwind's Dark Mode
	</a>{' '}
	to enable multiple strategies to control the overall app or page mode, as well as{' '}
	<a className="anchor" href="https://tailwindcss.com/docs/color-scheme" target="_blank" rel="external">
		Color Scheme
	</a>{' '}
	to selectively toggle light or dark interfaces at any scope.
</p>

}

## Dark Mode

Tailwind [multiple strategies](https://tailwindcss.com/docs/dark-mode) for configuring Dark Mode.

### Media Strategy

Enable by default. Uses CSS's [prefers-color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme) and sets the active mode based on operating system settings.

### Selector Strategy

Activates dark mode by adding or removing the `.dark` class to your application's `<html>` element.

```css title="app.css"
@custom-variant dark (&:where(.dark, .dark *));
```

```html title="app.html"
<html class="dark">
	...
</html>
```

### Data Attribute Strategy

Uses a data attribute instead of a class to activate dark mode.

```css title="app.css"
@custom-variant dark (&:where([data-mode=dark], [data-mode=dark] *));
```

```html title="app.html"
<html data-mode="dark">
	...
</html>
```

### Using the Dark Variant

Apply a base style, then with Tailwind's `dark:` variant.

```html title="app.html"
<!-- Light Mode: White | Dark Mode: Black -->
<div class="bg-white dark:bg-black">...</div>
```

---

## Color Scheme

Skeleton now supports Tailwind's [Color Scheme](https://tailwindcss.com/docs/color-scheme) feature, which enables toggling light or dark interfaces at any scope. By default, the scheme matches the current Dark Mode setting. This feature is enabled by [Color Pairings](/docs/design/colors#color-pairings), which implement the native CSS property [light-dark](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark).

```html
<div class="bg-primary-50-950">Light or Dark</div>

<div class="scheme-light">
	<div class="bg-primary-50-950">Always Light Scheme</div>
</div>

<div class="scheme-dark">
	<div class="bg-primary-50-950">Always Dark Scheme</div>
</div>
```

---

## Light Switch

Legacy versions of Skeleton offer a unique Light Switch component for controlling the Dark Mode `selector` strategy. Unfortunately this is no longer available due to the number of permutations required per framework and required feature capabilities, including:

- Supporting one or more combinations of Dark Mode strategies.
- Supporting the unique APIs of each meta-framework.
- Handling state and persistence; ex: local vs remote vs account-based storage

We now recommend you generate your own component following [Tailwind's best practices](https://tailwindcss.com/docs/dark-mode). To help you get started, we've provided a Cookbook recipe covering the basics.

<figure class="linker bg-noise">
	<a class="btn preset-filled" href="/docs/guides/cookbook/light-switch">
		Light Switch Recipe &rarr;
	</a>
</figure>

---

## Cookbook

# Alerts

General purpose notifications to attract attention and provide critical actions.

```html
<div
	class="card preset-outlined-surface-950-50 grid w-full grid-cols-1 items-center gap-4 p-4 lg:grid-cols-[1fr_auto]"
>
	<div>
		<p class="font-bold">Hey, heads up!</p>
		<p class="text-xs opacity-60">Something of moderate importance has occurred.</p>
	</div>
	<div class="flex gap-1">
		<button class="btn preset-tonal hover:preset-filled">Dismiss</button>
	</div>
</div>
```

## Styling

For even more customization, try mixing and matching various [Presets](/docs/design/presets) classes.

```html
---
---

<div class="w-full space-y-8">
	<div
		class="card preset-outlined-success-500 grid grid-cols-1 items-center gap-4 p-4 lg:grid-cols-[1fr_auto]"
	>
		<div>
			<p class="font-bold">Success</p>
			<p class="text-xs opacity-60">The task has been completed successfully.</p>
		</div>
		<div class="flex gap-1">
			<button class="btn preset-tonal hover:preset-filled">Dismiss</button>
		</div>
	</div>

	<div
		class="card preset-outlined-warning-500 grid grid-cols-1 items-center gap-4 p-4 lg:grid-cols-[auto_1fr_auto]"
	>
		<TriangleAlert />
		<div>
			<p class="font-bold">Warning</p>
			<p class="text-xs opacity-60">Beware of this important notice.</p>
		</div>
		<div class="flex gap-1">
			<button class="btn preset-tonal hover:preset-filled">Dismiss</button>
		</div>
	</div>

	<div
		class="card preset-outlined-error-500 grid grid-cols-1 items-center gap-4 p-4 lg:grid-cols-[auto_1fr_auto]"
	>
		<TriangleAlert />
		<div>
			<p class="font-bold">Error</p>
			<p class="text-xs opacity-60">Something has gone wrong.</p>
		</div>
		<div class="flex gap-1">
			<button class="btn preset-tonal hover:preset-filled">Dismiss</button>
		</div>
	</div>
</div>
```

---

# Breadcrumbs

Displays the current navigation hierarchy.

```html
<ol class="flex items-center gap-4">
	<li><a class="opacity-60 hover:underline" href="#">Blog</a></li>
	<li class="opacity-50" aria-hidden>&rsaquo;</li>
	<li><a class="opacity-60 hover:underline" href="#">Category</a></li>
	<li class="opacity-50" aria-hidden>&rsaquo;</li>
	<li>Article</li>
</ol>
```

## Icons

Feel free to mix in icons for the anchor labels or separators.

```html
---
---

<ol class="flex items-center gap-4">
	<li>
		<a class="opacity-60 hover:opacity-100" href="#">
			<House size="{24}" />
		</a>
	</li>
	<li class="opacity-50" aria-hidden>
		<ChevronRight size="{14}" />
	</li>
	<li>
		<a class="opacity-60 hover:opacity-100" href="#">
			<Cog size="{24}" />
		</a>
	</li>
	<li class="opacity-50" aria-hidden>
		<ChevronRight size="{14}" />
	</li>
	<li>Current</li>
</ol>
```

---

# Chat

Create a custom chat feed or AI prompt interface.

<Preview client:visible>
	<Fragment slot="preview">
		<Example client:visible />
	</Fragment>
	<Fragment slot="codeReact">
		<Code code={`Coming soon...`} lang="tsx" />
	</Fragment>
	<Fragment slot="codeSvelte">
		<Code code={ExampleRaw} lang="svelte" />
	</Fragment>
</Preview>

## Layout Columns

Use Tailwind's [grid column](https://tailwindcss.com/docs/grid-template-columns) utility classes to define horizontal columns for your layout.

```html
<!--
https://tailwindcss.com/docs/grid-template-columns#arbitrary-values
- auto: size to content widths
- 1fr: fill available space evenly
- {amount}: set fixed size (ex: 320px)
-->
<div class="grid w-full grid-cols-[auto_1fr_auto] gap-1">
	<div class="bg-surface-100-900 p-4">(nav)</div>
	<div class="bg-surface-100-900 p-4">(feed)</div>
	<div class="bg-surface-100-900 p-4">(online)</div>
</div>
```

## Layout Rows

Use Tailwind's [grid row](https://tailwindcss.com/docs/grid-template-rows) utility classes to define vertical layout rows for your layout.

```html
<!--
https://tailwindcss.com/docs/grid-template-rows#arbitrary-values
- auto: size to content widths
- 1fr: fill available space evenly
- {amount}: set fixed size (ex: 320px)
-->
<div class="grid w-full grid-cols-2 gap-10">
	<!-- Three Row Layout -->
	<div class="grid h-full grid-rows-[auto_1fr_auto] gap-1">
		<div class="bg-surface-100-900 p-4">(search)</div>
		<div class="bg-surface-100-900 p-4">(list)</div>
		<div class="bg-surface-100-900 p-4">(footer)</div>
	</div>
	<!-- Two Row Layout -->
	<div class="grid h-full grid-rows-[1fr_auto] gap-1">
		<!-- We've set a max height here to trigger the vertical overflow. -->
		<!-- Removed max-h and space-y in your project. -->
		<div class="bg-surface-100-900 max-h-[128px] space-y-4 overflow-y-auto p-4">
			<p>(feed)</p>
			<p>
				Lorem, ipsum dolor sit amet consectetur adipisicing elit. Reprehenderit dolor ullam, qui et
				itaque quam distinctio dicta nostrum veritatis harum iure hic sequi aperiam, explicabo earum
				totam deserunt. Fugiat, temporibus.
			</p>
		</div>
		<div class="bg-surface-100-900 p-4">(prompt)</div>
	</div>
</div>
```

## Message Feed

The feed simply loops through the available feed data. Each `<pre>` tag represents a single _bubble_ element.

```html
---
let messageFeed = [
	{
		id: 0,
		host: true,
		avatar: 48,
		name: 'Jane',
		timestamp: 'Yesterday @ 2:30pm',
		message: 'Some message text.',
		color: 'variant-soft-primary'
	},
	{
		id: 1,
		host: false,
		avatar: 14,
		name: 'Michael',
		timestamp: 'Yesterday @ 2:45pm',
		message: 'Some message text.',
		color: 'variant-soft-primary'
	}
];
---

<section class="max-h-[400px] w-full space-y-4 overflow-y-auto">
	<!-- Loop through the messageFeed array -->
	{ messageFeed.map((bubble) => { // Determine if host/guest role const role = bubble.host === true
	? 'host' : 'guest'; // Render the bubble template return
	<pre class="pre">{JSON.stringify({ role, ...bubble }, null, 2)}</pre>
	; }) }
</section>
```

## Message Bubbles

Provide styling to each bubble element.

```html
---

let messageFeed = [
	{
		id: 0,
		host: true,
		avatar: 48,
		name: 'Jane',
		timestamp: 'Yesterday @ 2:30pm',
		message: 'Some message text.',
		color: 'preset-tonal-primary'
	},
	{
		id: 1,
		host: false,
		avatar: 14,
		name: 'Michael',
		timestamp: 'Yesterday @ 2:45pm',
		message: 'Some message text.',
		color: 'preset-tonal-primary'
	}
];
---

<section class="w-full max-h-[400px] overflow-y-auto space-y-4">
	<!-- Loop through the messageFeed array -->
	{
		messageFeed.map((bubble) => {
			return (
				<>

					{bubble.host ? (
						// Host Bubble
						<div class="grid grid-cols-[auto_1fr] gap-2">
							<Avatar src={`https://i.pravatar.cc/?img=${bubble.avatar}`} name={bubble.name} size="size-12" />
							<div class="card p-4 preset-tonal rounded-tl-none space-y-2">
								<header class="flex justify-between items-center">
									<p class="font-bold">{bubble.name}</p>
									<small class="opacity-50">{bubble.timestamp}</small>
								</header>
								<p>{bubble.message}</p>
							</div>
						</div>
					) : (
						// Guest Bubble
						<div class="grid grid-cols-[1fr_auto] gap-2">
							<div class={`card p-4 rounded-tr-none space-y-2 ${bubble.color}`}>
								<header class="flex justify-between items-center">
									<p class="font-bold">{bubble.name}</p>
									<small class="opacity-50">{bubble.timestamp}</small>
								</header>
								<p>{bubble.message}</p>
							</div>
							<Avatar src={`https://i.pravatar.cc/?img=${bubble.avatar}`} name={bubble.name} size="size-12" />
						</div>
					)}
				</>
			);
		})
	}
</section>

```

## Prompt

Use Skeleton's [input group](/docs/tailwind/forms#groups) styles to create a custom text prompt.

---

## Scroll to Bottom

Bind your scrollable feed panel element reference ([Svelte](https://svelte.dev/docs/svelte/bind) | [React](https://react.dev/learn/referencing-values-with-refs#refs-and-the-dom)), then use [scrollTo](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollTo) to scroll the panel to the bottom on demand. Scroll behavior can be set via `behavior: 'smooth'`.

```ts
function scrollChatBottom(behavior?: 'auto' | 'instant' | 'smooth' = 'smooth') {
	// `elemChat` represents our scrollable panel element
	elemChat.scrollTo({ top: elemChat.scrollHeight, behavior });
}
```

## Add a Message

Below we'll cover how to append the message feed with a new message from the host user. Per our above examples, we'll use the same `messageFeed` data structure.

```ts
let messageFeed = [
	/* ...*/
];
```

Then bind to the textarea for your prompt in order to capture any message typed by the user.

<Preview selected="codeReact" client:visible>
	<Fragment slot="codeReact">```tsx let elemPrompt: HTMLElement = useRef(); ```</Fragment>
	<Fragment slot="codeSvelte">```ts let elemPrompt: HTMLElement; ```</Fragment>
</Preview>

<Preview selected="codeReact" client:visible>
	<Fragment slot="codeReact">
		```tsx
		<textarea ref={elemPrompt} ... />
		```
	</Fragment>
	<Fragment slot="codeSvelte">
		```svelte
		<textarea bind:value={elemPrompt} ... />
		```
	</Fragment>
</Preview>

Here's an example of how we might append a new message to the `messageFeed` array.

```ts
function addMessage(): void {
	const newMessage = {
		id: messageFeed.length,
		host: true,
		avatar: 48,
		name: 'Jane',
		timestamp: new date(),
		message: elemPrompt.value,
		color: 'preset-tonal-primary',
	};
	// Append the new message to the message feed
	messageFeed = [...messageFeed, newMessage];
	// Clear the textarea message
	elemPrompt.value = '';
	// Smoothly scroll to the bottom of the feed
	setTimeout(() => {
		scrollChatBottom('smooth');
	}, 0);
}
```

This can be triggered when the prompt's SEND button is clicked.

```svelte
<button ... onclick={addMessage}>Send</button>
```

---

# Clipboard API

Learn how to integrate the native browser clipboard API.

## How It Works

Refer to the [Clipboard API](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API) documentation for details.

## Programmatic

```html
<button class="btn preset-filled" data-button>Copy to Clipboard</button>

<script>
	// Define your source data
	const sourceData = 'Hello world';

	// Select your trigger element
	const elemButton: HTMLButtonElement | null = document.querySelector('[data-button]');

	// Add a click event handler to the trigger
	elemButton?.addEventListener('click', () => {
		// Call the Clipboard API
		navigator.clipboard
			// Use the `writeText` method write content to the clipboard
			.writeText(sourceData)
			// Handle confirmation
			.then(() => console.log('Source data copied to clipboard!'));
	});
</script>
```

## Using Inputs

```html
<div class="flex items-center gap-4">
	<input type="text" class="input" value="Hello Skeleton" data-source />
	<button class="btn preset-filled" data-trigger>Copy</button>
</div>

<script>
	// Create element references
	const elemButton: HTMLButtonElement | null = document.querySelector('[data-trigger]');
	const elemInput: HTMLInputElement | null = document.querySelector('[data-source]');

	// Add a click event handler to the trigger
	elemButton?.addEventListener('click', () => {
		// Call the Clipboard API
		navigator.clipboard
			// Use the `writeText` method write content to the clipboard
			.writeText(elemInput?.value || '')
			// Handle confirmation
			.then(() => console.log('Input value copied to clipboard!'));
	});
</script>
```

---

# Dialog Element

Implement a simple popup dialog using the native HTML element.

```html
<!-- Dialog -->
<dialog
	data-dialog
	class="rounded-container bg-surface-100-900 backdrop:bg-surface-50/75 dark:backdrop:bg-surface-950/75 top-1/2 left-1/2 z-10 max-w-[640px] -translate-1/2 space-y-4 p-4 text-inherit"
>
	<h2 class="h3">Hello world!</h2>
	<p>This is an example popover created using the native Dialog element.</p>
	<form method="dialog" class="flex justify-end">
		<button type="button" class="btn preset-tonal" data-dialog-close>Close</button>
	</form>
</dialog>
<!-- Interface -->
<div class="flex items-center justify-center">
	<!-- Trigger -->
	<button class="btn preset-filled" data-dialog-show>Open Modal</button>
</div>

<script>
	// DOM Element References
	const elemModal: HTMLDialogElement | null = document.querySelector('[data-dialog]');
	const elemTrigger: HTMLButtonElement | null = document.querySelector('[data-dialog-show]');
	const elemClose: HTMLButtonElement | null = document.querySelector('[data-dialog-close]');

	// Button Click Handlers
	elemTrigger?.addEventListener('click', () => elemModal?.showModal());
	elemClose?.addEventListener('click', () => elemModal?.close());
</script>

<style>
	/* NOTE: add the following styles to your global stylesheet. */
	dialog,
	dialog::backdrop {
		--anim-duration: 250ms;
		transition:
			display var(--anim-duration) allow-discrete,
			overlay var(--anim-duration) allow-discrete,
			opacity var(--anim-duration);
		opacity: 0;
	}
	/* Animate In */
	dialog[open],
	dialog[open]::backdrop {
		opacity: 1;
	}
	/* Animate Out */
	@starting-style {
		dialog[open],
		dialog[open]::backdrop {
			opacity: 0;
		}
	}
</style>
```

## How It Works

This is enabled by the native [Dialog](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog) element, which includes a dedicated Javascript API for toggling the display.

## Animations

Animating `display: none` with CSS alone has limited browser support. However, per the video below, we can use progressive enchancement our dialog to ensure animations degrade gracefully for unsupported browsers.

<iframe
	class="w-full aspect-video"
	src="https://www.youtube.com/embed/vmDEHAzj2XE?si=GTYFY9dk013lL0Y3"
	title="YouTube video player"
	frameborder="0"
	allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
	referrerpolicy="strict-origin-when-cross-origin"
	allowfullscreen
></iframe>

## Alternatives

If you need finer grain control, consider Skeleton's integration guides for [Floating UI](https://floating-ui.com/).

- [React Popovers](/docs/integrations/popover/react) - powered by Floating UI React.
- [Svelte Popovers](/docs/integrations/popover/svelte) - powered by Floating UI Svelte.

---

# Dynamic Theme Loading

Load skeleton themes on demand.

## About Themes

The most common way to load skeleton themes is by importing them in your root stylesheet.

<Preview selected="codeReact" client:visible>
	<Fragment slot="codeReact">
		```css title="app/globals.css"
		@import 'tailwindcss';

    	@import '@skeletonlabs/skeleton';
    	@import '@skeletonlabs/skeleton/themes/cerberus';
    	@import '@skeletonlabs/skeleton/themes/catppuccin';
    	```
    </Fragment>
    <Fragment slot="codeSvelte">
    	```css title="src/app.css"
    	@import 'tailwindcss';

    	@import '@skeletonlabs/skeleton';
    	@import '@skeletonlabs/skeleton/themes/cerberus';
    	@import '@skeletonlabs/skeleton/themes/catppuccin';
    	```
    </Fragment>

</Preview>

This will bundle your themes when you build your application, for that reason you should only import the themes you need because they will increase your CSS bundle size.

While this is sufficient for most applications this might not be flexible enough for your needs, you may want themes to be
user specific, editable, organization specific and so on, since skeleton themes are just CSS variables there are many ways
you can load themes on demand, read further to see how.

## Creating Stylesheets on layout load

This approach assumes the CSS variables of the skeleton theme you want is available during the load function (eg: on your database or in memory).

In this example we will add a default theme that that can be used as a fallback.

<Preview selected="codeReact" client:visible>
	<Fragment slot="codeReact">
		```css title="app/globals.css"
		@import 'tailwindcss';

    	@import '@skeletonlabs/skeleton';
    	@import './default.css';
    	```
    </Fragment>
    <Fragment slot="codeSvelte">
    	```css title="src/app.css"
    	@import 'tailwindcss';

    	@import '@skeletonlabs/skeleton';
    	@import './default.css';
    	```
    </Fragment>

</Preview>

<Preview selected="codeReact" client:visible>
    <Fragment slot="codeReact">
    	```css title="app/default.css"
    	[data-theme='default'] {
    		/* ... */
    	}
    	```
    </Fragment>
    <Fragment slot="codeSvelte">
    	```css title="src/default.css"
    	[data-theme='default'] {
    		/* ... */
    	}
    	```
 </Fragment>

</Preview>

<Preview selected="codeReact" client:visible>
    <Fragment slot="codeReact">
		To load your themes we will utilize the [NextJS `getServerSideProps` function](https://nextjs.org/docs/pages/building-your-application/data-fetching/get-server-side-props) function in combination with [Head component](https://nextjs.org/docs/pages/api-reference/components/head):

    	```tsx title="app/layout.tsx"
    	import Head from 'next/head';
    	import type { InferGetServerSidePropsType, GetServerSideProps } from 'next';

    	const getThemes = async () => {
    		return [
    			{
    				name: 'theme-1',
    				css: `[data-theme='theme-1'] { /* ... */ }`
    			},
    			{
    				name: 'theme-2',
    				css: `[data-theme='theme-2'] { /* ... */ }`
    			}
    		];
    	};

    	export const getServerSideProps = (async () => {
    		const themes = getThemes();
    		return {
    			props: {
    				themes: ['default', ...themes.map((t) => t.name)],
    				css: themes.map((theme) => theme.css).join('\n\n')
    			}
    		};
    	}) satisfies GetServerSideProps<{ repo: Repo }>;

    	export default function Page({ repo }: InferGetServerSidePropsType<typeof getServerSideProps>) {
    		return (
    			<>
    				<Head>
    					<style dangerouslySetInnerHTML={{ __html: css }} />
    				</Head>
    				<main>
    					<p>{repo.stargazers_count}</p>
    				</main>
    			</>
    		);
    	}
    	```
    </Fragment>
    <Fragment slot="codeSvelte">
    	To load your themes we will utilize the [SvelteKit `load` function](https://svelte.dev/docs/kit/load) function in combination with [`<svelte:head>`](https://svelte.dev/docs/svelte/svelte-head):

    	```ts title="src/route/+layout.server.ts"
    	import type { PageLoad } from './$types';

    	const getThemes = async () => {
    		return [
    			{
    				name: 'theme-1',
    				css: `[data-theme='theme-1'] { /* ... */ }`
    			},
    			{
    				name: 'theme-2',
    				css: `[data-theme='theme-2'] { /* ... */ }`
    			}
    		];
    	};

    	export const load: PageLoad = async (event) => {
    		const themes = getThemes();
    		return {
    			themes: ['default', ...themes.map((t) => t.name)],
    			css: themes.map((theme) => theme.css).join('\n\n')
    		};
    	};
    	```

    	<br />

    	```svelte title="src/routes/+layout.svelte"
    	<script>
    		const { data } = $props();
    	</script>

    	<svelte:head>
    		{@html `<style>${data.css}</style>`}
    	</svelte:head>
    	```

     </Fragment>

</Preview>

> ⚠️ _Important_ make sure you sanitize the CSS before inserting it or you'll be vulernable to CSS injection.

After doing so you should be able to toggle themes on demand by changing the `data-theme` attribute on the `html` tag.

Note that there are multiple ways to go about this problem, another way could be to generate CSS files with
the same content as the one in this example and then load only the css files you want, while this
is more complex than storing and retrieving themes as JSON on a database this approach could benefit
from the browser caching mechanism.

---

# Image Layouts

Layouts for displaying sets of images.

## Grid

```html
<section class="grid grid-cols-2 gap-6 md:grid-cols-3">
	<!-- Row -->
	<img
		class="bg-surface-500 rounded-container h-48 w-48"
		src="https://picsum.photos/192/192?random=1"
	/>
	<img
		class="bg-surface-500 rounded-container h-48 w-48"
		src="https://picsum.photos/192/192?random=2"
	/>
	<img
		class="bg-surface-500 rounded-container h-48 w-48"
		src="https://picsum.photos/192/192?random=3"
	/>
	<!-- Row -->
	<img
		class="bg-surface-500 rounded-container h-48 w-48"
		src="https://picsum.photos/192/192?random=4"
	/>
	<img
		class="bg-surface-500 rounded-container h-48 w-48"
		src="https://picsum.photos/192/192?random=5"
	/>
	<img
		class="bg-surface-500 rounded-container h-48 w-48"
		src="https://picsum.photos/192/192?random=6"
	/>
	<!-- Row -->
	<img
		class="bg-surface-500 rounded-container h-48 w-48"
		src="https://picsum.photos/192/192?random=7"
	/>
	<img
		class="bg-surface-500 rounded-container h-48 w-48"
		src="https://picsum.photos/192/192?random=8"
	/>
	<img
		class="bg-surface-500 rounded-container h-48 w-48"
		src="https://picsum.photos/192/192?random=9"
	/>
</section>
```

## Quad

```html
<section class="grid grid-cols-2 gap-4">
	<!-- Row -->
	<img
		class="bg-surface-500 rounded-container h-64 w-64"
		src="https://picsum.photos/256/256?random=1"
	/>
	<img
		class="bg-surface-500 rounded-container h-64 w-64"
		src="https://picsum.photos/256/256?random=2"
	/>
	<!-- Row -->
	<img
		class="bg-surface-500 rounded-container h-64 w-64"
		src="https://picsum.photos/256/256?random=3"
	/>
	<img
		class="bg-surface-500 rounded-container h-64 w-64"
		src="https://picsum.photos/256/256?random=4"
	/>
</section>
```

## Masonry

```html
<section class="grid grid-cols-2 gap-4 md:grid-cols-4">
	<!-- Column -->
	<div class="grid gap-4">
		<img class="bg-surface-500 rounded-container" src="https://picsum.photos/220/320?random=1" />
		<img class="bg-surface-500 rounded-container" src="https://picsum.photos/220/120?random=2" />
		<img class="bg-surface-500 rounded-container" src="https://picsum.photos/220/280?random=3" />
	</div>
	<!-- Column -->
	<div class="grid gap-4">
		<img class="bg-surface-500 rounded-container" src="https://picsum.photos/220/300?random=4" />
		<img class="bg-surface-500 rounded-container" src="https://picsum.photos/220/280?random=5" />
		<img class="bg-surface-500 rounded-container" src="https://picsum.photos/220/140?random=6" />
	</div>
	<!-- Column -->
	<div class="grid gap-4">
		<img class="bg-surface-500 rounded-container" src="https://picsum.photos/220/280?random=7" />
		<img class="bg-surface-500 rounded-container" src="https://picsum.photos/220/320?random=8" />
		<img class="bg-surface-500 rounded-container" src="https://picsum.photos/220/140?random=9" />
	</div>
	<!-- Column -->
	<div class="grid gap-4">
		<img class="bg-surface-500 rounded-container" src="https://picsum.photos/220/320?random=10" />
		<img class="bg-surface-500 rounded-container" src="https://picsum.photos/220/140?random=11" />
		<img class="bg-surface-500 rounded-container" src="https://picsum.photos/220/280?random=12" />
	</div>
</section>
```

## Featured

```html
<section class="grid gap-4">
	<!-- Featured -->
	<header>
		<img
			class="bg-surface-500 rounded-container h-auto max-w-full"
			src="https://picsum.photos/960/512?random=1"
		/>
	</header>
	<!-- Row -->
	<div class="grid grid-cols-5 gap-4">
		<img
			class="bg-surface-500 rounded-container h-full w-full"
			src="https://picsum.photos/200/200?random=2"
		/>
		<img
			class="bg-surface-500 rounded-container h-full w-full"
			src="https://picsum.photos/200/200?random=3"
		/>
		<img
			class="bg-surface-500 rounded-container h-full w-full"
			src="https://picsum.photos/200/200?random=4"
		/>
		<img
			class="bg-surface-500 rounded-container h-full w-full"
			src="https://picsum.photos/200/200?random=5"
		/>
		<img
			class="bg-surface-500 rounded-container h-full w-full"
			src="https://picsum.photos/200/200?random=6"
		/>
	</div>
</section>
```

## Attribution

Images courtesy of [Lorem Picsum](https://picsum.photos/). Markup and styles inspired by [Flowbite](https://flowbite.com/docs/components/gallery/#masonry-grid).

---

# Light Switch

Learn how to create a Light Switch toggle.

Use [Dark Mode](/docs/guides/mode) to make use of either a base or `dark:` variant for your utility class styles. By default, Tailwind uses the `prefers-color-scheme` media query to determine and match the user's operating system settings. However, if you wish to provide your users manual control, you'll need to adjust the Dark Mode strategy for Tailwind, as well as provide the toggle interface (aka a light switch). This guide will show you how to fulfill both requirements.

<Process>
	<ProcessStep step="1">
        ## Adjust the Dark Mode Strategy
        Open your global stylesheet and set the following variant:
        ```css
       	@custom-variant dark (&:where([data-mode="dark"], [data-mode="dark"] *));
        ```
		Then set the following data attribute on your application's `<html>` element for light mode:
		```html
		<html data-mode="light"></html>
		```
		Or for dark mode:
		```html
		<html data-mode="dark"></html>
		```
    </ProcessStep>
	<ProcessStep step="2">
        ## Create the Component
        We'll create a implementation of the Switch component that can toggle the mode on demand.
	   ```html
'use client';

    const [checked, setChecked] = useState(false);

    useEffect(() => {
    	const mode = localStorage.getItem('mode') || 'light';
    	setChecked(mode === 'dark');
    }, []);

    const onCheckedChange = (event: { checked: boolean }) => {
    	const mode = event.checked ? 'dark' : 'light';
    	document.documentElement.setAttribute('data-mode', mode);
    	localStorage.setItem('mode', mode);
    	setChecked(event.checked);
    };

    return (
    	<>
    		<script
    			dangerouslySetInnerHTML={{
    				__html: `
    	const mode = localStorage.getItem('mode') || 'light';
    	document.documentElement.setAttribute('data-mode', mode);
          `
    			}}
    		/>
    		<Switch checked={checked} onCheckedChange={onCheckedChange} />
    	</>
    );

}

````
    </ProcessStep>
    <ProcessStep step="3">
    	## Import the Component
    	We'll then add the component to our app. Make sure to set the correct path and file extension.
    	```ts
    	import Lightswitch from './path/to/Lightswitch.{tsx|svelte}';
    	```
    	```svelte
    	<Lightswitch />
    	```
    </ProcessStep>
</Process>

## User Interface

While we utilize a primitive Switch for the minimal example above, feel free to adjust the logic and interface to your preference. We provide a more detailed Switch example for [React](/docs/components/switch/react#light-switch) and [Svelte](/docs/components/switch/svelte#light-switch) respectively.

## Next.js Users

For Next.js users, you will need to [suppressHydrationWarning](https://nextjs.org/docs/messages/react-hydration-error#solution-3-using-suppresshydrationwarning) to `true` on the root `<html>` element. This will suppress hydration warnings.

---

# Logo Clouds
Provides a grid for presenting a set of logos, brands, or sponsors.

```html
<nav class="rounded-container grid w-full grid-cols-1 gap-1 overflow-hidden md:grid-cols-3">
	<a class="card preset-filled-surface-100-900 rounded-none p-4 py-8 text-center" href="#">Twitch</a>
	<a class="card preset-filled-surface-100-900 rounded-none p-4 py-8 text-center" href="#">YouTube</a>
	<a class="card preset-filled-surface-100-900 rounded-none p-4 py-8 text-center" href="#">TicTok</a>
</nav>

````

## Rows

```html
<nav class="rounded-container grid w-full grid-cols-2 gap-1 overflow-hidden md:grid-cols-4">
	<a class="card preset-filled-surface-100-900 rounded-none p-4 py-8 text-center" href="#"
		>Optimize</a
	>
	<a class="card preset-filled-surface-100-900 rounded-none p-4 py-8 text-center" href="#">Brand</a>
	<a class="card preset-filled-surface-100-900 rounded-none p-4 py-8 text-center" href="#">Mesh</a>
	<a class="card preset-filled-surface-100-900 rounded-none p-4 py-8 text-center" href="#"
		>Matrix</a
	>
	<a class="card preset-filled-surface-100-900 rounded-none p-4 py-8 text-center" href="#"
		>Utilize</a
	>
	<a class="card preset-filled-surface-100-900 rounded-none p-4 py-8 text-center" href="#"
		>Syndicate</a
	>
	<a class="card preset-filled-surface-100-900 rounded-none p-4 py-8 text-center" href="#"
		>Incubate</a
	>
	<a class="card preset-filled-surface-100-900 rounded-none p-4 py-8 text-center" href="#"
		>Orchestrate</a
	>
</nav>
```

---

# Scroll Containers

Create scrolling containers using the scroll snap features from Tailwind.

## Scroll Snap

Implements Tailwind's [Scroll Snap Alignment](https://tailwindcss.com/docs/scroll-snap-align) utility classes.

```html
<div class="w-full">
	<!-- Scroll Container -->
	<div
		class="flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto scroll-smooth px-4 py-10"
	>
		<!-- Generate a array of 8 items; loop through each item -->
		{ Array.from({ length: 8 }).map((_, i) => ( // Each scrollable card element
		<div class="card preset-filled w-40 shrink-0 snap-start py-20 text-center md:w-80">
			<span>{i + 1}</span>
		</div>
		)) }
	</div>
</div>
```

## Carousels

Using Scroll Containers, we can create a fully functional carousel, complete with thumbnail selection.

```html
---

const generatedArray = Array.from({ length: 6 });
---

<div class="w-full">
	<!-- Carousel -->
	<div class="card p-4 grid grid-cols-[auto_1fr_auto] gap-4 items-center">
		<!-- Button: Left -->
		<button type="button" class="btn-icon preset-filled" data-carousel-left>
			<ArrowLeft size={16} />
		</button>
		<!-- Full Images -->
		<div data-carousel class="snap-x snap-mandatory scroll-smooth flex overflow-x-auto">
			<!-- Loop X many times. -->
			{
				generatedArray.map((_, i: number) => (
					<img
						class="snap-center w-[1024px] rounded-container"
						src={`https://picsum.photos/seed/${i + 1}/1024/768`}
						alt={`full-${i}`}
						loading="lazy"
					/>
				))
			}
		</div>
		<!-- Button: Right -->
		<button type="button" class="btn-icon preset-filled" data-carousel-right>
			<ArrowRight size={16} />
		</button>
	</div>
	<!-- Thumbnails -->
	<div class="card p-4 grid grid-cols-6 gap-4">
		<!-- Loop X many times. -->
		{
			generatedArray.map((_, i: number) => (
				<button type="button" data-thumbnail>
					<img
						class="rounded-container hover:brightness-125"
						src={`https://picsum.photos/seed/${i + 1}/256`}
						alt={`thumb-${i}`}
						loading="lazy"
					/>
				</button>
			))
		}
	</div>
</div>

<script>
	// Query Element References
	const elemCarousel: HTMLDivElement | null = document.querySelector('[data-carousel]');
	const elemCarouselLeft: HTMLButtonElement | null = document.querySelector('[data-carousel-left]');
	const elemCarouselRight: HTMLButtonElement | null = document.querySelector('[data-carousel-right]');
	const elemThumbnails: NodeListOf<HTMLElement> = document.querySelectorAll('[data-thumbnail]');

	// Set Left/Right arrow click handlers
	elemCarouselLeft?.addEventListener('click', () => carouselLeft());
	elemCarouselRight?.addEventListener('click', () => carouselRight());

	// Set thumbnail click handler
	if (elemThumbnails.length > 0) {
		elemThumbnails.forEach((elemButton: HTMLElement, index: number) => {
			elemButton?.addEventListener('click', () => carouselThumbnail(index));
		});
	}

	/** On navigation left, scroll the container */
	function carouselLeft() {
		if (!elemCarousel) return;
		const x =
			elemCarousel.scrollLeft === 0
				? elemCarousel.clientWidth * elemCarousel.childElementCount // loop
				: elemCarousel.scrollLeft - elemCarousel.clientWidth; // step left
		elemCarousel.scroll(x, 0);
	}

	/** On navigation right, scroll the container */
	function carouselRight() {
		if (!elemCarousel) return;
		const x =
			elemCarousel.scrollLeft === elemCarousel.scrollWidth - elemCarousel.clientWidth
				? 0 // loop
				: elemCarousel.scrollLeft + elemCarousel.clientWidth; // step right
		elemCarousel.scroll(x, 0);
	}

	/** On thumbnail click, scroll large image into view */
	function carouselThumbnail(index: number) {
		if (elemCarousel) elemCarousel.scroll(elemCarousel.clientWidth * index, 0);
	}
</script>

```

## Multi-Column

Using Scroll Containers, we can scroll sets of items.

```html
---

interface Movie {
	name: string;
	imageUrl: string;
	url: string;
}

// Data and images via: https://www.themoviedb.org/
	{
		name: 'The Flash',
		imageUrl: 'https://www.themoviedb.org/t/p/w600_and_h900_bestv2/rktDFPbfHfUbArZ6OOOKsXcv0Bm.jpg',
		url: 'https://www.themoviedb.org/movie/298618-the-flash'
	},
	{
		name: 'Guardians of the Galaxy Vol. 3',
		imageUrl: 'https://www.themoviedb.org/t/p/w600_and_h900_bestv2/r2J02Z2OpNTctfOSN1Ydgii51I3.jpg',
		url: 'https://www.themoviedb.org/movie/447365-guardians-of-the-galaxy-vol-3'
	},
	{
		name: 'Black Panther: Wakanda Forever',
		imageUrl: 'https://www.themoviedb.org/t/p/w600_and_h900_bestv2/sv1xJUazXeYqALzczSZ3O6nkH75.jpg',
		url: 'https://www.themoviedb.org/movie/505642-black-panther-wakanda-forever'
	},
	{
		name: 'Avengers: Infinity War',
		imageUrl: 'https://www.themoviedb.org/t/p/w600_and_h900_bestv2/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg',
		url: 'https://www.themoviedb.org/movie/299536-avengers-infinity-war'
	},
	{
		name: 'Spider-Man: No Way Home',
		imageUrl: 'https://www.themoviedb.org/t/p/w600_and_h900_bestv2/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
		url: 'https://www.themoviedb.org/movie/634649-spider-man-no-way-home'
	},
	{
		name: 'The Batman',
		imageUrl: 'https://www.themoviedb.org/t/p/w600_and_h900_bestv2/74xTEgt7R36Fpooo50r9T25onhq.jpg',
		url: 'https://www.themoviedb.org/movie/414906-the-batman'
	},
	{
		name: 'Iron Man',
		imageUrl: 'https://www.themoviedb.org/t/p/w600_and_h900_bestv2/78lPtwv72eTNqFW9COBYI0dWDJa.jpg',
		url: 'https://www.themoviedb.org/movie/1726-iron-man'
	},
	{
		name: 'Venom: Let There Be Carnage',
		imageUrl: 'https://www.themoviedb.org/t/p/w600_and_h900_bestv2/rjkmN1dniUHVYAtwuV3Tji7FsDO.jpg',
		url: 'https://www.themoviedb.org/movie/580489-venom-let-there-be-carnage'
	},
	{
		name: 'Deadpool',
		imageUrl: 'https://www.themoviedb.org/t/p/w600_and_h900_bestv2/3E53WEZJqP6aM84D8CckXx4pIHw.jpg',
		url: 'https://www.themoviedb.org/movie/293660-deadpool'
	}
];
---

<div class="w-ful">
	<div class="grid grid-cols-[auto_1fr_auto] items-center gap-4">
		<!-- Button: Left -->
		<button type="button" class="btn-icon preset-filled" data-multi-column-left>
			<ArrowLeft size="{16}" />
		</button>
		<!-- Carousel -->
		<div
			data-multi-column
			class="flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-smooth pb-2"
		>
			<!-- Loop through our array of movies. -->
			{ movies.map((movie) => (
			<a href="{movie.url}" target="_blank" class="w-[28%] shrink-0 snap-start">
				<img
					class="rounded-container-token hover:brightness-125"
					src="{movie.imageUrl}"
					alt="{movie.name}"
					title="{movie.name}"
					loading="lazy"
				/>
			</a>
			)) }
		</div>
		<!-- Button-Right -->
		<button type="button" class="btn-icon preset-filled" data-multi-column-right>
			<ArrowRight size="{16}" />
		</button>
	</div>
</div>

<script>
	// Query Element References
	const elemMovies: HTMLDivElement | null = document.querySelector('[data-multi-column]')!;
	const elemBtnLeft: HTMLButtonElement | null = document.querySelector('[data-multi-column-left]');
	const elemBtnRight: HTMLButtonElement | null = document.querySelector('[data-multi-column-right]');

	// Add Button click handlers
	elemBtnLeft?.addEventListener('click', () => multiColumnLeft());
	elemBtnRight?.addEventListener('click', () => multiColumnRight());

	/** Handles the left scroll event. */
	function multiColumnLeft() {
		if (!elemMovies) return;
		let x = elemMovies.scrollWidth;
		if (elemMovies.scrollLeft !== 0) x = elemMovies.scrollLeft - elemMovies.clientWidth;
		elemMovies.scroll(x, 0);
	}

	/** Handles the right scroll event. */
	function multiColumnRight() {
		if (!elemMovies) return;
		let x = 0;
		// -1 is used because different browsers use different methods to round scrollWidth pixels.
		if (elemMovies.scrollLeft < elemMovies.scrollWidth - elemMovies.clientWidth - 1) x = elemMovies.scrollLeft + elemMovies.clientWidth;
		elemMovies.scroll(x, 0);
	}
</script>
```

> Images courtesy of [The Movie Database](https://www.themoviedb.org/)

## API Reference

Learn more about Tailwind's utility classes for scroll behavior and scroll snap.

| Feature                                                             | Description                                                         |
| ------------------------------------------------------------------- | ------------------------------------------------------------------- |
| [scroll-behavior](https://tailwindcss.com/docs/scroll-behavior)     | Controls the scroll behavior of an element.                         |
| [scroll-margin](https://tailwindcss.com/docs/scroll-margin)         | Controls the scroll offset around items in a snap container.        |
| [scroll-padding](https://tailwindcss.com/docs/scroll-padding)       | Controls an element's scroll offset within a snap container.        |
| [scroll-snap-align](https://tailwindcss.com/docs/scroll-snap-align) | Controls the scroll snap alignment of an element.                   |
| [scroll-snap-stop](https://tailwindcss.com/docs/scroll-snap-stop)   | Controls whether you can skip past possible snap positions.         |
| [scroll-snap-type](https://tailwindcss.com/docs/scroll-snap-type)   | Controls how strictly snap points are enforced in a snap container. |

---

# Stepper

Divide and present content in sequenced steps.

<Preview client:visible>
	<Fragment slot="preview">
		<Example client:visible />
	</Fragment>
	<Fragment slot="codeReact">
		<Code code={`Coming soon...`} lang="tsx" />
	</Fragment>
	<Fragment slot="codeSvelte">
		<Code code={ExampleRaw} lang="svelte" />
	</Fragment>
</Preview>

## Using Components

Optionally, you can substitute primitive data for components and props.

<Preview client:visible>
	<Fragment slot="preview">
		<ExampleComponent client:visible />
	</Fragment>
	<Fragment slot="codeReact">
		<Code code={`Coming soon...`} lang="tsx" />
	</Fragment>
	<Fragment slot="codeSvelte">
		<div class="space-y-4">
			<Code code={ExampleComponentRaw} lang="svelte" />
			<Code code={ExampleStepOne} lang="svelte" title="ExampleStepOne.svelte" />
		</div>
	</Fragment>
</Preview>

---

# SVG Filters

Apply filter effects to elements and images.

## How It Works

This feature is enabled by [SVG filters](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/filter) paired with [feColorMatrix](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feColorMatrix) transformations.

## Usage

Apply a filter to any element using the Filter style property and passing the unique SVG Filter ID.

```astro
<!-- The Target Element -->
<img ... style="filter: url(#Apollo)" />

<!-- Via aribtrary Tailwind syntax -->
<Avatar classes="[filter:url(#Apollo)]" />

<!-- The SVG Filter with a matching unique ID -->
<svg><filter id="Apollo">...</filter></svg>
```

We've provided a curated collection of SVG Filters to choose from below.

```html
<!-- Apollo: `filter: url(#Apollo)` -->
<svg id="svg-filter-apollo" class="absolute -left-full h-0 w-0">
	<filter
		id="Apollo"
		filterUnits="objectBoundingBox"
		primitiveUnits="userSpaceOnUse"
		color-interpolation-filters="sRGB"
	>
		<feColorMatrix
			values="0.8 0.6 -0.4 0.1 0,
			0 1.2 0.05 0 0,
			0 -1 3 0.02 0,
			0 0 0 50 0"
			result="final"
			in="SourceGraphic"
		></feColorMatrix>
	</filter>
</svg>
```

## Create a Filter

We recommend [SVG Color Matrix Mixer](https://fecolormatrix.com/) by [Rik Schennink](https://x.com/rikschennink/) to create your own filters.

## Tips

- The SVG must be in the same scope as the elements you wish to filter. Global scope is acceptable.
- Consder storing your SVGs within your local project for quick and reusable imports.
- All Vite-based frameworks support [SVG imports](https://vite.dev/guide/assets.html#importing-asset-as-url).
- Optionally you can embed the SVG within a imported component (ex: `Apollo.svelte`, `Apollo.tsx`).
- Filter SVGs are affected by the flow DOM, including class styles such as `space-{x|y}`.

---

# Table of Contents

Navigate the hierarchy of headings for the current page.

```html
---
interface PageHeadings {
	/** The text value within the heading tag; stripped of HTML. */
	text: string;
	/** A generated slug value based on the text. */
	slug: string;
	/** Depth indicates headings H1-H6. */
	depth: number;
}

/** The generated list of page headings, slugs, and depth. */
const headings: PageHeadings[] = [
	{ text: 'Real World Example', slug: 'real-world-example', depth: 1 },
	{ text: 'Semantic Markup', slug: 'semantic-markup', depth: 1 },
	{ text: 'Utilities', slug: 'utilities', depth: 1 },
	{ text: 'Grid', slug: 'grid', depth: 2 },
	{ text: 'Alignment', slug: 'alignment', depth: 2 },
	{ text: 'Responsive Design', slug: 'responsive-design', depth: 2 },
	{ text: 'In Conclusion', slug: 'in-conclusion', depth: 1 }
];

/** Provide a padding-left class based on the depth. */
function setIndentationClass(depth: number) {
	// prettier-ignore
	switch(depth) {
		case(6): return 'pl-12';
		case(5): return 'pl-10';
		case(4): return 'pl-8';
		case(3): return 'pl-6';
		case(2): return 'pl-4';
		case(1): return 'pl-2';
		default: return 'pl-0';
	}
}
---

<nav class="card bg-surface-100-900 p-4">
	<!-- Table of Contents -->
	<div class="space-y-2 text-sm">
		<!-- Label -->
		<div class="font-bold">On This Page</div>
		<!-- Links -->
		<ul class="space-y-2">
			<!-- Consider a fixed scroll position at the top of your page layouts. -->
			<li><a href="{`#_top`}" class="anchor block">Overview</a></li>
			<!-- Loop through the available headings. -->
			{ headings.map((heading: PageHeadings) => (
			<li>
				<a
					href="{`#${heading.slug}`}"
					class="anchor block"
					class:list="{setIndentationClass(heading.depth)}"
				>
					{heading.text}
				</a>
			</li>
			)) }
		</ul>
	</div>
</nav>
```

## Deep Linking

Browsers allow you to deep link to any element via the ID. This is accomplished with an anchor tag and hashed (`#`) href value. When interacting with these anchors, the viewport will automatically attempt to scroll the `<body>` element and bring the element into view.

```html
<h2 class="#some-example-slug">
	Some Example Heading
	<h2></h2>
</h2>
```

```html
<a href="#real-world-example" class="anchor">Some Example Heading</a>
```

> TIP: If you abstract scrolling away from the `<body>` element, this will not work.

## Scroll Behavior

You may optionally choose to implement a smooth [scroll behavior](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-behavior) using CSS.

```html
<body class="smooth-scroll"></body>
```

```css
body {
	scroll-behavior: smooth;
}
```

## Generate a Slug

The following provides a barebones implementation for generating a slug based on a heading text value.

```ts
function generateSlug(text: string, prefix?: string = '', suffix?: string = '') {
	// Format the slug from the text value.
	const slug = text
		.toLowerCase()
		.replaceAll(/[^a-zA-Z0-9 ]/g, '')
		.replaceAll(' ', '-')
		.toLowerCase();
	// Note that you can optionally apply a prefix/suffix.
	return `${prefix}${slug}${suffix}`;
}

// Usage
generateSlug('An Example Header'); // result: an-example-header
generateSlug('An Example Header', 'skeleton-'); // result: skeleton-an-example-header
generateSlug('An Example Header', '', '-skeleton'); // result: an-example-header-skeleton
```

## Guides

Specific instructions for generating headings will differ based on your meta-framework and your application architecture. Below are a few suggestions, but this is neither a definitive or exhaustive list of all available options.

- [Astro](https://kld.dev/building-table-of-contents/) - enables you to automatically generate headings using built-in MDX features.
- [Svelte](https://www.melt-ui.com/docs/builders/table-of-contents) - Melt UI provides a headless component solution for Svelte.
- [Next.js](https://nextra.site/docs/docs-theme/theme-configuration#toc-sidebar) - Nextra provides a headless component solution for Next.js + MDX.
- [Rehype Plugin](https://github.com/stefanprobst/rehype-extract-toc) - a general purpose Rehype plugin for generating a table of contents.

---

# Design

# Colors

The Skeleton color system.

## Color Palette

<ExampleColors />

Supports <u>all</u> standard Tailwind color utility classes using the following pattern.

```
{property}-{color}-{shade}
```

| Key      | Accepted Values                                                                                                  |
| -------- | ---------------------------------------------------------------------------------------------------------------- |
| Property | `accent`, `bg`, `border`, `caret`, `decoration`, `divide`, `fill`, `outline`, `ring`, `shadow`, `stroke`, `text` |
| Color    | `primary`, `secondary`, `tertiary`, `success`, `warning`, `error`, `surface`                                     |
| Shade    | `50`, `100`, `200`, `300`, `400`, `500`, `600`, `700`, `800`, `900`, `950`                                       |

```html
<div class="bg-primary-500">...</div>
<div class="border-secondary-600 border">...</div>
<svg class="fill-surface-950">...</svg>
```

---

## Contrast Colors

Contrast color values are available for every shade. Use these to set accessible text color and icon fill values.

```
{property}-{color}-contrast-{shade}
```

```html
<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
	<!-- Standard Colors -->
	<div class="bg-primary-500 text-primary-contrast-500">
		<p class="p-4 text-center">Standard Colors</p>
	</div>
	<!-- Color Pairings -->
	<div class="bg-secondary-200-800 text-secondary-contrast-200-800">
		<p class="p-4 text-center">Color Pairings</p>
	</div>
</div>
```

See the [Preset system](/docs/design/presets) for additional utility classes that automatically mix each color and contrast tone.

---

## Color Pairings

Provides a condensed syntax of dual-tone color values balanced to swap between light and dark mode. These are supported for all the same properties standard colors support (`bg`, `border`, `fill`, etc).

```
{property}-{color}-{lightModeShade}-{darkModeShade}
```

For example:

- `bg-surface-200-800`
- `text-primary-400-600`
- `border-secondary-50-950`

### How Pairings Work

Color Pairing are enabled through the use of the CSS [light-dark](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark) function. For example, the `text-primary-300-700` pairing will be implemnted in your CSS bundle as follows:

```css
.text-primary-300-700 {
	color: light-dark(var(--color-primary-300), var(--color-primary-700));
}
```

This roughly equivalent to the following, just more compact, and enabling support for Tailwind's [Color Scheme](https://tailwindcss.com/docs/color-scheme) utilities.

```html
<div class="text-primary-300 dark:text-primary-700">...</div>
```

By default, Skeleton sets the overall app's color scheme to match light or dark mode.

### Pairing Previews

The following is a static representation of each pairing. Only `primary` is shown, but all Skeleton colors are supported.

<ExamplePairings />

The following shows actual Color Pairings. Toggle this website between light and dark mode to see how these react.

<ExamplePairingsDynamic />

### When to use Pairings

Color Parings are useful for generating a hierarchy of visual layers, ranging from foreground to background elements. Each reuse the same color ramp but, but inverts the order when toggling from light to dark mode.

<Preview client:visible>
	<Fragment slot="preview">
		<ExamplePairingsStack />
	</Fragment>
	<Fragment slot="code">
		```html
		<div class="bg-primary-950-50">Foreground</div>
		<div class="bg-primary-900-100">...</div>
		<div class="bg-primary-800-200">...</div>
		<div class="bg-primary-700-300">...</div>
		<div class="bg-primary-600-400">...</div>
		<div class="bg-primary-500">Branding</div>
		<div class="bg-primary-400-600">...</div>
		<div class="bg-primary-300-700">...</div>
		<div class="bg-primary-200-800">...</div>
		<div class="bg-primary-100-900">...</div>
		<div class="bg-primary-50-950">Background</div>
		```
	</Fragment>
</Preview>

- We can use shade `950` for light mode and `50` from dark mode to represent our body text color.
- Then use shade `50` from light mode and `950` from dark mode to represent our app background.
- Use the static `500` shade for key branding elements, such as buttons or banners.
- Then reserve multiple layers between for elements such as cards, inputs, and more.

---

## Transparency

Both Skeleton Colors and Color Pairings support Tailwind's color transparency syntax.

```html
<div class="bg-primary-500/25">Primary Color @ 25% transparency</div>
<div class="bg-surface-50-950/60">Surface Pairing 50/950 @ 60% transparency</div>
```

---

# Presets

Canned styles for your interface elements.

{

<p className="text-xl">
	Presets are pre-defined styles that allow you to quickly and easily style buttons, badges, cards, and more. Create by mixing Skeleton and
	Tailwind primitives.
</p>

}

```html
<script lang="ts">
	import IconBookmark from '@lucide/svelte/icons/bookmark';
	const diagramCircle =
		'preset-tonal w-8 aspect-square flex justify-center items-center rounded-full';
</script>

<div class="grid grid-cols-2 gap-10 md:grid-cols-4">
	<!-- 1. Filled -->
	<div class="flex flex-col items-center gap-4">
		<button type="button" class="btn preset-filled-primary-500">Filled</button>
		<div class="{diagramCircle}">1</div>
	</div>
	<!-- 2. Tonal -->
	<div class="flex flex-col items-center gap-4">
		<button type="button" class="btn preset-tonal-primary">Tonal</button>
		<div class="{diagramCircle}">2</div>
	</div>
	<!-- 3. Outlined -->
	<div class="flex flex-col items-center gap-4">
		<button type="button" class="btn preset-outlined-primary-500">Outlined</button>
		<div class="{diagramCircle}">3</div>
	</div>
	<!-- 4. Glass -->
	<div class="flex flex-col items-center gap-4">
		<button type="button" class="btn preset-glass-primary">Glass</button>
		<div class="{diagramCircle}">4</div>
	</div>
	<!-- 5. Elevated -->
	<div class="flex flex-col items-center gap-4">
		<button type="button" class="btn preset-filled-surface-100-900 shadow-xl">Elevated</button>
		<div class="{diagramCircle}">5</div>
	</div>
	<!-- 6. Ghost -->
	<div class="flex flex-col items-center gap-4">
		<button type="button" class="btn hover:preset-tonal">Ghost</button>
		<div class="{diagramCircle}">6</div>
	</div>
	<!-- 7. Ghost (Icon) -->
	<div class="flex flex-col items-center gap-4">
		<button type="button" class="btn hover:preset-tonal-primary">
			<IconBookmark className="size-6" />
		</button>
		<div class="{diagramCircle}">7</div>
	</div>
	<!-- 8. Gradient -->
	<div class="flex flex-col items-center gap-4">
		<button type="button" class="btn preset-gradient">Gradient</button>
		<div class="{diagramCircle}">8</div>
	</div>
</div>

<style>
	/* Create a custom preset in your global stylesheet */
	.preset-gradient {
		background-image: linear-gradient(-45deg, var(--color-primary-300), var(--color-primary-700));
		color: var(--color-primary-contrast-500);
	}
	.preset-glass-primary {
		background: color-mix(in oklab, var(--color-primary-500) 40%, transparent);
		box-shadow: 0 0px 30px color-mix(in oklab, var(--color-primary-500) 50%, transparent) inset;
		backdrop-filter: blur(16px);
	}
</style>
```

1. **Filled** - a filled preset of the primary brand color.
2. **Tonal** - a tonal preset of the primary brand color.
3. **Outlined** - an outlined preset of the primary brand color.
4. **Glass** - a custom preset using background transparency and backdrop blur.
5. **Elevated** - mixes a filled preset with a shadow.
6. **Ghost** - has no style by default, but shows a tonal preset on hover.
7. **Ghost Icon** - has no style by default, but shows a branded tonal preset on hover.
8. **Gradient** - a custom preset generated using Tailwind gradient primitives.

## Enabling Presets

Skeleton provides an optional set of presets for `filled`, `tonal`, and `outlined` styles. To enable these, simply add the following import to your global stylesheet. This is recommended for new users to Skeleton.

```css
@import '@skeletonlabs/skeleton/optional/presets';
```

## Skeleton Presets

Skeleton's provides the following opinionated set of styles, including accessible backgrounds and text colors.

### Filled

```
preset-filled-{color}-{lightModeShade}-{darkModeShade}
```

```html
<div class="grid w-full grid-cols-2 gap-2 lg:grid-cols-4">
	<div class="preset-filled flex items-center justify-center p-4">(neutral)</div>

	<div class="preset-filled-primary-950-50 flex items-center justify-center p-4">950-50</div>
	<div class="preset-filled-primary-900-100 flex items-center justify-center p-4">900-100</div>
	<div class="preset-filled-primary-800-200 flex items-center justify-center p-4">800-200</div>
	<div class="preset-filled-primary-700-300 flex items-center justify-center p-4">700-300</div>
	<div class="preset-filled-primary-600-400 flex items-center justify-center p-4">600-400</div>
	<div class="preset-filled-primary-500 flex items-center justify-center p-4">500</div>
	<div class="preset-filled-primary-400-600 flex items-center justify-center p-4">400-600</div>
	<div class="preset-filled-primary-300-700 flex items-center justify-center p-4">300-700</div>
	<div class="preset-filled-primary-200-800 flex items-center justify-center p-4">200-800</div>
	<div class="preset-filled-primary-100-900 flex items-center justify-center p-4">100-900</div>
	<div class="preset-filled-primary-50-950 flex items-center justify-center p-4">50-950</div>
</div>
```

### Tonal

```
preset-tonal-{color}
```

```html
<div class="grid w-full grid-cols-2 gap-2 lg:grid-cols-4">
	<div class="preset-tonal flex items-center justify-center p-4">(neutral)</div>

	<div class="preset-tonal-primary flex items-center justify-center p-4">primary</div>
	<div class="preset-tonal-secondary flex items-center justify-center p-4">secondary</div>
	<div class="preset-tonal-tertiary flex items-center justify-center p-4">tertiary</div>
	<div class="preset-tonal-success flex items-center justify-center p-4">success</div>
	<div class="preset-tonal-warning flex items-center justify-center p-4">warning</div>
	<div class="preset-tonal-error flex items-center justify-center p-4">error</div>
	<div class="preset-tonal-surface flex items-center justify-center p-4">surface</div>
</div>
```

### Outlined

```
preset-outlined-{color}-{shade}-{shade}
```

```html
<div class="grid w-full grid-cols-2 gap-2 lg:grid-cols-4">
	<div class="preset-outlined flex items-center justify-center p-4">(neutral)</div>

	<div class="preset-outlined-primary-950-50 flex items-center justify-center p-4">950-50</div>
	<div class="preset-outlined-primary-900-100 flex items-center justify-center p-4">900-100</div>
	<div class="preset-outlined-primary-800-200 flex items-center justify-center p-4">800-200</div>
	<div class="preset-outlined-primary-700-300 flex items-center justify-center p-4">700-300</div>
	<div class="preset-outlined-primary-600-400 flex items-center justify-center p-4">600-400</div>
	<div class="preset-outlined-primary-500 flex items-center justify-center p-4">500</div>
	<div class="preset-outlined-primary-400-600 flex items-center justify-center p-4">400-600</div>
	<div class="preset-outlined-primary-300-700 flex items-center justify-center p-4">300-700</div>
	<div class="preset-outlined-primary-200-800 flex items-center justify-center p-4">200-800</div>
	<div class="preset-outlined-primary-100-900 flex items-center justify-center p-4">100-900</div>
	<div class="preset-outlined-primary-50-950 flex items-center justify-center p-4">50-950</div>
</div>
```

## Custom Presets

For advanced users, we recommend disabing the Skeleton presets in favor of custom-generated presets. This ensures you retain full control over the look and feel of each element. Consider these best practices when creating presets.

- Custom presets are only limited by your imagination.
- Use any combination of Skeleton or Tailwind-provided primitive to generate a preset.
- Apply presets to any relevant element, including: buttons, cards, inputs, and more.
- Use a set naming convention, such as `preset-{foo}` to keep things standardized.
- Implement all presets in using Tailwind's [@utility directive](https://tailwindcss.com/docs/functions-and-directives#utility-directive) in your global stylesheet.
- Abstrast presets to a stylesheet or NPM package for shared used between projects.

```html
<div class="grid w-full max-w-[320px] grid-rows-3 gap-4">
	<input type="text" class="input" value="Default Input State!" />
	<input type="text" class="input preset-input-success" value="Valid Input State!" />
	<input type="text" class="input preset-input-error" value="Invalid Input State!" />
</div>

<style>
	/* Add each custom preset to your global stylesheet. */
	.preset-input-success {
		background-color: var(--color-success-100);
		color: var(--color-success-900);
	}
	.preset-input-error {
		background-color: var(--color-error-100);
		color: var(--color-error-900);
	}
</style>
```

### Gradient Presets

Tailwind provides a number of powerful [Gradient](https://tailwindcss.com/docs/gradient-color-stops) utility classes that can be used to generate presets.

```html
<div class="w-full space-y-4">
	<div class="grid grid-cols-3 gap-4">
		<button class="btn preset-gradient-one">Button</button>
		<button class="btn preset-gradient-two">Button</button>
		<button class="btn preset-gradient-three">Button</button>
	</div>
	<div class="grid grid-cols-3 gap-4 text-center">
		<div class="card preset-gradient-one p-4">Card</div>
		<div class="card preset-gradient-two p-4">Card</div>
		<div class="card preset-gradient-three p-4">Card</div>
	</div>
</div>

<style>
	/* Create a custom preset in your global stylesheet */
	.preset-gradient-one {
		background-image: linear-gradient(45deg, var(--color-primary-500), var(--color-tertiary-500));
		color: var(--color-primary-contrast-500);
	}
	.preset-gradient-two {
		background-image: linear-gradient(45deg, var(--color-error-500), var(--color-warning-500));
		color: var(--color-error-contrast-500);
	}
	.preset-gradient-three {
		background-image: linear-gradient(45deg, var(--color-success-500), var(--color-warning-500));
		color: var(--color-success-contrast-500);
	}
</style>
```

### Glass Presets

```html
---
const baseClasses = 'card p-4 text-white text-center flex justify-start items-center';
---

<div
	class="rounded-container flex w-full items-center justify-center space-y-4 bg-[url(https://picsum.photos/id/249/1024/1024)] bg-cover bg-center bg-no-repeat p-4"
>
	<div class="grid w-full grid-cols-1 gap-2">
		<div class:list="{`${baseClasses}" preset-glass-neutral`}>Neutral</div>
		<div class:list="{`${baseClasses}" preset-glass-primary`}>Primary</div>
		<div class:list="{`${baseClasses}" preset-glass-secondary`}>Secondary</div>
		<div class:list="{`${baseClasses}" preset-glass-tertiary`}>Tertiary</div>
		<div class:list="{`${baseClasses}" preset-glass-success`}>Success</div>
		<div class:list="{`${baseClasses}" preset-glass-warning`}>Warning</div>
		<div class:list="{`${baseClasses}" preset-glass-error`}>Error</div>
		<div class:list="{`${baseClasses}" preset-glass-surface`}>Surface</div>
	</div>
</div>

<style>
	/* Create a custom preset in your global stylesheet */
	.preset-glass-neutral {
		background: color-mix(in oklab, var(--color-surface-50-950) 30%, transparent);
		box-shadow: 0 0px 30px color-mix(in oklab, var(--color-surface-50-950) 30%, transparent) inset;
		backdrop-filter: blur(16px);
	}
	/* --- */
	.preset-glass-primary {
		background: color-mix(in oklab, var(--color-primary-500) 40%, transparent);
		box-shadow: 0 0px 30px color-mix(in oklab, var(--color-primary-500) 50%, transparent) inset;
		backdrop-filter: blur(16px);
	}
	.preset-glass-secondary {
		background: color-mix(in oklab, var(--color-secondary-500) 40%, transparent);
		box-shadow: 0 0px 30px color-mix(in oklab, var(--color-secondary-500) 50%, transparent) inset;
		backdrop-filter: blur(16px);
	}
	.preset-glass-tertiary {
		background: color-mix(in oklab, var(--color-tertiary-500) 40%, transparent);
		box-shadow: 0 0px 30px color-mix(in oklab, var(--color-tertiary-500) 50%, transparent) inset;
		backdrop-filter: blur(16px);
	}
	.preset-glass-success {
		background: color-mix(in oklab, var(--color-success-500) 40%, transparent);
		box-shadow: 0 0px 30px color-mix(in oklab, var(--color-success-500) 50%, transparent) inset;
		backdrop-filter: blur(16px);
	}
	.preset-glass-warning {
		background: color-mix(in oklab, var(--color-warning-500) 40%, transparent);
		box-shadow: 0 0px 30px color-mix(in oklab, var(--color-warning-500) 50%, transparent) inset;
		backdrop-filter: blur(16px);
	}
	.preset-glass-error {
		background: color-mix(in oklab, var(--color-error-500) 40%, transparent);
		box-shadow: 0 0px 30px color-mix(in oklab, var(--color-error-500) 50%, transparent) inset;
		backdrop-filter: blur(16px);
	}
	.preset-glass-surface {
		background: color-mix(in oklab, var(--color-surface-500) 40%, transparent);
		box-shadow: 0 0px 30px color-mix(in oklab, var(--color-surface-500) 50%, transparent) inset;
		backdrop-filter: blur(16px);
	}
</style>
```

---

# Spacing

Set a dynamic scale for application whitespace.

This is enabled by the [Tailwind spacing system](https://tailwindcss.com/blog/tailwindcss-v4#dynamic-utility-values-and-variants).

<Preview client:load>
	<Fragment slot="preview">
		<Example client:visible />
	</Fragment>
	<Fragment slot="code">
		<div class="space-y-4">
			Scaling can be adjusted by modifying the [type scale](/docs/get-started/core-api#typography) theme property.
			```css
			[data-theme='cerberus'] {
				--spacing: 0.25rem;
			}
			```
		</div>
	</Fragment>
</Preview>

This affects the following utilities.

- `padding`
- `margin`
- `width`
- `minWidth`
- `maxWidth`
- `height`
- `minHeight`
- `maxHeight`
- `gap`
- `inset`
- `space`
- `translate`

---

# Themes

The Skeleton theme system.

{

<p class="text-xl">
	Skeleton themes utilize{' '}
	<a className="anchor" href="https://developer.mozilla.org/en-US/docs/Web/CSS/--*" target="_blank" rel="external">
		CSS custom properties
	</a>{' '}
	to define core settings for your design system. Provided with a number of presets theme out of the box, as well as a powerful theme
	generator to create your own. Enable one or more and quickly switch on-demand.
</p>
}

---

## Preset Themes

Skeleton is provided with high quality set of hand curated themes, as shown below.

<ThemesList />

Tap the theme preview above to copy the theme name to your clipboard. Then implement any desired theme in your app's global stylesheet.

```css title="app.css" {3}
/* @import '@skeletonlabs/skeleton'; */
/* @import '@skeletonlabs/skeleton/optional/presets'; */
@import '@skeletonlabs/skeleton/themes/{theme-name}';
```

> Make sure to replace `{theme-name}` with your desired theme names.

## Custom Themes

Use our powerful Theme Generator app to create your own themes.

<figure class="linker bg-noise">
	<a href="https://themes.skeleton.dev/" target="_blank" class="btn preset-filled">
		Theme Generator
	</a>
</figure>

1. Open the Theme Generator and customize to your preference.
2. Make sure to set a unique name for your theme.
3. Tap the "code" view from the menu at top-right corner.
4. Tap the "copy" button at the top of copy the theme contents.
5. Paste the contents into a new file at your project root, such as `my-theme-name.css` (any name is fine).

Follow the step below to register any number of custom themes. Take care to match each theme's file name.

## Register Themes

You may register any number of themes by adding addition theme imports to your global stylesheet. Please note that each theme will slightly increase the final CSS bundle size.

```css
/* @import '@skeletonlabs/skeleton'; */
/* @import '@skeletonlabs/skeleton/optional/presets'; */

/* Register Preset Themes */
@import '@skeletonlabs/skeleton/themes/cerberus';
@import '@skeletonlabs/skeleton/themes/mona';
@import '@skeletonlabs/skeleton/themes/vox';

/* Register a Custom Themes */
/* Make sure to resolve the relative path. */
/* Note the .css extension is optional. */
@import '../{my-theme-name}';
```

## Activate a Theme

You may define the active theme using the `data-theme` attribute on your `<html>` element.

```html
<html data-theme="cerberus">
	...
</html>
```

> TIP: If you wish to create a theme switcher, this is the value you should aim to modify.

---

## Customize and Extend

### Modify Properties

You can modify any [theme property](/docs/get-started/core-api) on demand using the following technique. Simply add this to your global stylesheet, following all Tailwind and Skeleton configuration. Use this to override preset theme properties.

```css title="app.css"
[data-theme='cerberus'] {
	--spacing: 0.22rem;
	--radius-container: 0.375rem;
	--heading-font-weight: bolder;
}
```

### Target Themes

If your application supports multiple themes, you may isolate selection using the `data-theme` attribute. Just make sure to account for light and dark mode color values.

```css title="app.css"
/** Target only Cerberus .h1 elements. */
[data-theme='cerberus'] .h1 {
	color: red;
	@variant dark {
		color: green;
	}
}
/** Target only Mona .h1 elements. */
[data-theme='mona'] .h1 {
	color: blue;
	@variant dark {
		color: yellow;
	}
}
```

### Backgrounds

Your app's light and dark mode background color values can be adjusted using the following [theme properties](/docs/get-started/core-api#colors).

```css title="app.css"
[data-theme='cerberus'] body {
	--body-background-color: pink;
	--body-background-color-dark: green;
}
```

Background images are supported, including CSS mesh gradients. The following example adheres to theme colors.

```css title="app.css"
[data-theme='cerberus'] body {
	background-image:
		radial-gradient(
			at 24% 25%,
			color-mix(in oklab, var(--color-primary-500) 30%, transparent) 0px,
			transparent 30%
		),
		radial-gradient(
			at 35% 13%,
			color-mix(in oklab, var(--color-success-500) 18%, transparent) 0px,
			transparent 30%
		),
		radial-gradient(
			at 100% 64%,
			color-mix(in oklab, var(--color-error-500) 3%, transparent) 0px,
			transparent 40%
		);
	background-attachment: fixed;
	background-position: center;
	background-repeat: no-repeat;
	background-size: cover;
}
```

We recommend Mesher for generating custom mesh gradients. This will generate colors using RGB, but can be migrated to utilize `var()` for colors and `color-mix()` for transparency, per the example above.

<figure class="linker bg-noise">
	<a class="btn preset-filled" href="https://csshero.org/mesher/" target="_blank">
		Mesher by CSS Hero
	</a>
</figure>

### Custom Fonts

Skeleton recommends the use of [Fontsource](https://fontsource.org/) for installing and managing custom fonts.

<figure class="linker bg-noise">
	<a class="btn preset-filled" href="https://fontsource.org/" target="_blank">
		Browse Fontsource
	</a>
</figure>

Install your font of choice.

```console
npm install @fontsource/open-sans
```

Then import each font at the top of your global stylesheet, but below your Tailwind configuration.

```css title="app.css"
@import '@fontsource/open-sans';
```

Finally, use the following [theme properties](/docs/get-started/core-api#base-1) to set each respective font-family property. Note that for custom themes, these settings are can be defined directly within each respective theme file.

```css title="app.css"
[data-theme='cerberus'] {
	--heading-font-family: 'Open Sans', sans-serif;
	--base-font-family: 'Open Sans', sans-serif;
	--anchor-font-family: 'inherit';
}
```

## Core API

For more information, please refer to the full [Core API](/docs/get-started/core-api) documentation.

---

# Typography

The Skeleton typography system.

{

<p class="text-xl">
	Skeleton provides an array of opt-in utility classes for common typographic elements, with a fully functional typography scale based on
	your theme settings. As well as a number of primitives for generating a semantic typography set for your project's individual needs.
</p>

}

## Typographic Scale

Skeleton introduces customizable [Typographic Scale](https://designcode.io/typographic-scales) to Tailwind's [font-size](https://tailwindcss.com/docs/font-size) properties.

<Preview client:load>
	<Fragment slot="preview">
		<ExampleTypescale client:visible />
	</Fragment>
	<Fragment slot="code">
		<div class="space-y-4">
			Scaling can be adjusted by modifying the [type scale](/docs/get-started/core-api#typography) theme property.
			```css
			[data-theme='cerberus'] {
				--text-scaling: 1.067;
			}
			```
			This affects the following text sizes.
			```html
			<h1 class="text-xs">text-xs</h1>
			<h2 class="text-sm">text-sm</h2>
			<h3 class="textba-base">text-base</h3>
			<h4 class="text-lg">text-lg</h4>
			<h5 class="text-xl">text-xl</h5>
			<h6 class="text2-2xl">text-2xl</h6>
			<h6 class="text3-3xl">text-3xl</h6>
			<h6 class="text4-4xl">text-4xl</h6>
			<h6 class="text5-5xl">text-5xl</h6>
			<h6 class="text6-6xl">text-6xl</h6>
			<h6 class="text7-7xl">text-7xl</h6>
			<h6 class="text8-8xl">text-8xl</h6>
			<h6 class="text9-9xl">text-9xl</h6>
			```
		</div>
	</Fragment>
</Preview>

## Utility Classes

Use the following utility classes to quickly style semantic HTML elements. These classes are opt-in by default, providing a simple escape hatch when you need to break from convention.

### Headings

```html
<div class="space-y-4">
	<h1 class="h1">Heading 1</h1>
	<h2 class="h2">Heading 2</h2>
	<h3 class="h3">Heading 3</h3>
	<h4 class="h4">Heading 4</h4>
	<h5 class="h5">Heading 5</h5>
	<h6 class="h6">Heading 6</h6>
</div>
```

### Paragraphs

```html
<p>The quick brown fox jumps over the lazy dog</p>
```

### Blockquotes

```html
<blockquote class="blockquote">
	"Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nesciunt, aliquid. Molestias, odio
	illum voluptatibus natus dignissimos, quidem est unde aspernatur veniam pariatur fuga distinctio
	esse in quas, repellendus neque reiciendis!"
</blockquote>
```

### Anchor

```html
<a href="/" class="anchor">Anchor</a>
```

### Pre-Formatted

```html
<pre class="pre">The quick brown fox jumps over the lazy dog.</pre>
```

### Code

```html
<div>Insert the <code class="code">.example</code> class here.</div>
```

### Keyboard

```html
<div>Press <kbd class="kbd">⌘</kbd> + <kbd class="kbd">C</kbd> to copy.</div>
```

### Insert & Delete

```html
<div class="w-full">
	<del class="del"><s>Always</s> Gonna Give You Up</del>
	<ins class="ins" cite="https://youtu.be/dQw4w9WgXcQ" datetime="10-31-2022">
		Never Gonna Give You Up
	</ins>
</div>
```

### Mark

```html
<!-- prettier-ignore -->
<p>
	Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nesciunt, <mark class="mark">aliquid</mark>. Molestias, odio illum voluptatibus <mark class="mark">natus dignissimos</mark>, quidem est unde aspernatur veniam pariatur fuga.
</p>
```
