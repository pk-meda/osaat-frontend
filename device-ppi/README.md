# device-ppi

PPi finder

## Install

```bash
npm install device-ppi
npx cap sync
```

## API

<docgen-index>

* [`echo(...)`](#echo)
* [`getPPI()`](#getppi)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### echo(...)

```typescript
echo(options: { value: string; }) => Promise<{ value: string; }>
```

| Param         | Type                            |
| ------------- | ------------------------------- |
| **`options`** | <code>{ value: string; }</code> |

**Returns:** <code>Promise&lt;{ value: string; }&gt;</code>

--------------------


### getPPI()

```typescript
getPPI() => Promise<{ xdpi?: number; ydpi?: number; ppi?: number; scale?: number; }>
```

**Returns:** <code>Promise&lt;{ xdpi?: number; ydpi?: number; ppi?: number; scale?: number; }&gt;</code>

--------------------

</docgen-api>
