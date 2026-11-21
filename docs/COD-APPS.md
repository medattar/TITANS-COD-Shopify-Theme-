# COD apps: EasySell and Releasit

The theme does not run its own COD checkout. COD order forms come from a COD app such as EasySell or Releasit. The theme gives them a clean place to plug in and stays out of their way.

> **Status: unverified.** Neither app was installed on a store during development, so this integration has not been tested live. The steps below follow how these apps document their theme integration. Test on a development or unpublished theme before going live.

## Purchase modes

You set the purchase mode in **Theme settings → Purchase and COD → Purchase mode**. Each **Buy buttons** block can override it.

| Mode | What it does |
| --- | --- |
| Native Shopify | Shows the theme's add-to-cart button and, optionally, dynamic checkout buttons. With the cart drawer, add to cart opens the drawer. |
| COD app managed | Hides the native button but keeps the product form, variant input and quantity on the page so the app can read them. Add the app's block or embed. |
| Product details on cards | On collection and home grids, set **Theme settings → Product cards → Card action** to "Go to product page" so customers always land on the product page where the COD form lives. |

## What the theme guarantees for apps

- There is one product form per product section: `form#product-form-{section.id}` with `input[name="id"]`. The quantity block is tied to it through the `form` attribute.
- When the variant changes, the theme updates `input[name="id"]` and fires a bubbling `change` event, so apps that listen to the form get the new variant.
- The theme also fires `titans:variant:change` on `document`, with `detail.variant` and `detail.sectionId`.
- Every product section accepts `@app` blocks, so app blocks can go anywhere in the buy column, including inside groups and the product header.
- The theme never overrides app JavaScript or styles app forms.
- When there's no native button, the sticky buy bar scrolls to the purchase area instead of submitting.

## EasySell setup

1. Install EasySell and finish its onboarding.
2. In the Theme Editor, open a product template, select the **Product information** section, and click **Add block → Apps → EasySell COD form** (the name may differ). Drag it under the variant picker.
3. Set **Buy buttons → Purchase mode** to "COD app managed", or remove the Buy buttons block. Otherwise customers see two purchase buttons.
4. If EasySell works through an **app embed** instead, enable it under **Theme settings → App embeds** and use the app's settings to place the button.
5. Test: change variants and quantity, submit a test order, and check the order and its variant in Shopify admin.

## Releasit setup

1. Install Releasit (COD Form & Upsells) and finish its onboarding.
2. Enable the Releasit app embed under **Theme settings → App embeds**, and/or add its app block to the **Product information** section.
3. Set the purchase mode to "COD app managed" if Releasit replaces the buy button.
4. Test variant changes, quantity, the form popup on mobile, and a test order.

## COD notice blocks

The **COD notice** block has presets with Mexican Spanish defaults. Every string can be edited.

- *Pago contra entrega*: "Paga cuando recibas tu pedido."
- *Confirmación por WhatsApp*: "Recibirás un mensaje por WhatsApp para confirmar tu pedido. Sin tu confirmación, tu pedido no será preparado ni enviado."
- Delivery reassurance, delivery regions, customer support and returns.

These notices are informational. The theme never sends WhatsApp messages. Confirmation messages must come from your COD app, an order-confirmation app, or your team.

## Known limits

- The cart drawer and cart page use Shopify's native checkout. If you need COD from the cart, configure it in your COD app (many apps add a cart button through an app embed).
- Accelerated checkout buttons (Shop Pay, etc.) are off by default because they skip the COD flow.
