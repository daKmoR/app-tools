# Pwa

## Install

```
npm i -S @thepassle/app-tools
```

## Usage

```js
import { Dialog } from '@thepassle/app-tools/dialog.js'; 

const dialog = new Dialog({
  foo: { 
    opening: ({dialog, parameters}) => {dialog.querySelector('form').innerHTML = 'hello world';},
    opened: ({dialog, parameters}) => {},
    closing: ({dialog}) => {},
    closed: ({dialog}) => {}
  },
  bar: someAbstraction({
    title: 'foo', 
    import: () => import('./my-component.js'),
    render: () => html`<my-dialog></my-dialog>`
  }),
});

dialog.open({id: 'foo'});
await dialog.opened;
dialog.isOpen; // true
/** Or */
dialog.opened.then((dialogNode) => {});

dialog.close();
await dialog.closed;
dialog.isOpen; // false
/** Or */
dialog.closed.then((dialogNode) => {});

dialog.addEventListener('opening', ({id, dialog}) => {});
dialog.addEventListener('opened', ({id, dialog}) => {});
dialog.addEventListener('closing', ({id, dialog}) => {
  console.log(dialog.returnValue);
});
dialog.addEventListener('closed', ({id, dialog}) => {
  if (id === 'foo') {
    console.log(dialog.returnValue);
  }

  if(dialog.returnValue === 'dismiss') {
    console.log('Dialog was closed via light dismiss');
  }

  if(dialog.returnValue === 'programmatic') {
    console.log('Dialog was closed via `dialog.close()`');
  }
});

dialog.modify((dialogNode) => {
  dialogNode.classList.add('foo');
});

/** You can also pass parameters to the dialog renderer */
dialog.open({
  id: 'foo', 
  parameters: {
    foo: 'bar'
  }
});
```

## Callbacks

```js
import { Dialog } from '@thepassle/app-tools/dialog.js'; 

const dialog = new Dialog({
  foo: { 
    /** 
     * Executed right after the dialog has been created and added to the DOM, before animations have run
     * Can be used for setup work, like adding `id`s to the dialog, lazy loading, 
     * and rendering to the dialog's DOM
     */
    opening: ({dialog, parameters}) => {},
    
    /** 
     * Executed after animations for the dialog element have run 
     */
    opened: ({dialog, parameters}) => {},
    
    /** 
     * Executed when the native <dialog>'s `close` event has fired, on "light dismiss", 
     * escape was pressed, or `dialog.close` was called
     * Executed before animations 
     * 
     * Has access to `dialog.returnValue`
     */
    closing: ({dialog}) => {},

    /** 
     * Executed after the dialog's close animations have run and right before the dialog node is removed from the DOM 
     * 
     * Has access to `dialog.returnValue`
     */
    closed: ({dialog}) => {}
  },
});
```

## Styling the dialog

It's recommended to provide a unique ID for the kind of dialog you want to show. For example:

```js
import { Dialog } from '@thepassle/app-tools/dialog.js'; 

const dialog = new Dialog({
  foo: { 
    opening: ({dialog, parameters}) => {
      dialog.id = 'foo';
    },
  },
});
```

You can then, in your global stylesheet, select the dialog like so:
```css
dialog[app-tools]#foo {
  border-radius: 10px;
  background: lightgrey;
  /* etc */
}

@media (max-width: 600px) {
  dialog[app-tools]#foo {
    width: 90%;
  }
}
```

## Animating the dialog

```js
import { Dialog } from '@thepassle/app-tools/dialog.js'; 

const dialog = new Dialog({
  foo: { 
    opening: ({dialog, parameters}) => {
      dialog.id = 'foo';
      dialog.form.innerHTML = 'hello world';
    },
  },
});

dialog.open({id: 'foo'});
```

```css
dialog[app-tools]#foo {
  opacity: 0;
  transform: translateY(40px);
  transition: opacity .3s ease-out, transform .3s ease-out;
}

dialog[app-tools][open]#foo {
  opacity: 1;
  transform: translateY(0);
}
```

## Abstractions

It can be useful to declare some abstractions for the different kinds of dialogs you want to use in your app. Here's an example using Lit:

```js
import { html, render } from 'lit';
import { Dialog } from '@thepassle/app-tools/dialog.js'; 

function modal(config) {
  return {
    opening: ({dialog, parameters}) => {
      config.import();
      render(config.render({parameters, title: config.title}), dialog.form);
    },
    closing: ({dialog}) => {
      console.log(dialog.returnValue); // "bar"
    }
  }
}

const dialog = new Dialog({
  foo: modal({
    title: 'Cart',
    import: () => import('./shopping-cart.js'),
    render: ({title, parameters}) => html`
      <h1>${title}</h1>
      <shopping-cart foo=${parameters.foo}></shopping-cart>
      <button value="bar">Close</button>
    `
  })
});

dialog.open({id: 'foo', parameters: { foo: 'bar' }});
```