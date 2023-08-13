import { describe, it, expect, vi } from 'vitest';
import { dom, up } from '.';

describe('props', () => {
  it('sets property', () => {
     const input = up(document.createElement('input'), {
      value: 'hello'
    });
    expect(input).toHaveValue('hello');
  });
  it('sets attribute', () => {
    const input = up(document.createElement('input'), {
      'data-trick': 'hello'
    });
    expect(input).toHaveAttribute('data-trick', 'hello');
  });
  it('removes attributes when null', () => {
    const input = document.createElement('input');
    input.setAttribute('data-trick', 'hello');
    up(input, {
      'data-trick': null
    });
    expect(input).not.toHaveAttribute('data-trick');
  });
  it('preserves attributes / props when absent', () => {
    const input = document.createElement('input');
    input.value = 'hello';
    input.setAttribute('data-trick', 'hello');
    up(input, {});
    expect(input).toHaveValue('hello');
    expect(input).toHaveAttribute('data-trick', 'hello');
  });
});

describe('events', () => {
  it('preserves attributes / props when absent', () => {
    const onClick = vi.fn();
    const button = up(document.createElement('button'), {
      on: {
        click: onClick
      }
    });
    button.click();
    expect(onClick).toBeCalledTimes(1);
  });
  it('updates event listener', () => {
    const onClick1 = vi.fn();
    const onClick2 = vi.fn();
    const button = up(document.createElement('button'), {
      on: {
        click: onClick1
      }
    });
    up(button, {
      on: {
        click: onClick2
      }
    });
    button.click();
    expect(onClick1).not.toBeCalled();
    expect(onClick2).toBeCalledTimes(1);
  });
  it('removes event listener', () => {
    const onClick = vi.fn();
    const button = up(document.createElement('button'), {
      on: {
        click: onClick
      }
    });
    up(button, {
      on: {
        click: null
      }
    });
    button.click();
    expect(onClick).not.toBeCalled();
  });it('preserves event listener if not specified', () => {
    const onClick = vi.fn();
    const button = up(document.createElement('button'), {
      on: {
        click: onClick
      }
    });
    up(button, { on: {} });
    button.click();
    expect(onClick).toBeCalledTimes(1);
  });
});

describe('style', () => {
  it('sets style', () => {
    const div = up(document.createElement('div'), {
      style: {

      }
    })
  });
  
  it('preserves existing style', () => {

  })
});

describe('children', () => {
  const build = () => {
    const root = document.createElement('div');
    const text = document.createTextNode('hello');
    const button = document.createElement('button');
    root.appendChild(text);
    root.appendChild(button);
    return { root, text, button };
  }
  it('preserves children if not specified', () => {
    const { root, text, button } = build();
    up(root, {});
    expect(root.childNodes[0]).toBe(text);
    expect(root.childNodes[1]).toBe(button);
  });
  
  it('removes children', () => {
    const { root } = build();
    up(root, { children: [] });
    expect(root.childNodes.length).toBe(0);
  });
  
  it('sets children', () => {
    const { root } = build();
    up(root, { 
      children: [
        'bye',
        dom('input', {}),
      ]
    });
    expect(root).toMatchInlineSnapshot(`
      <div>
        bye
        <input />
      </div>
    `)
  });

  it('supports falsy children', () => {
    const root = up(document.createElement('div'), { 
      children: [
        false,
        dom('input', {}),
        null,
        dom('input', {}),
      ]
    });
    expect(root).toMatchInlineSnapshot(`
      <div>
        <input />
        <input />
      </div>
    `);
  })
  
  describe('reuses children', () => {
    it('implicit keys', () => {
       const root = up(document.createElement('div'), { 
        children: [
          dom('input', {}),
          dom('button', {}),
        ]
      });
      const childNodes = [...root.childNodes];
      up(root, { 
        children: [
          dom('input', {}),
          dom('button', {}),
        ]
      })
      expect(root.childNodes[0]).toBe(childNodes[0]);
      expect(root.childNodes[1]).toBe(childNodes[1]);
      expect(root.childNodes.length).toBe(2);
    });
    
    it('explicit keys', () => {
      const root = up(document.createElement('div'), { 
       children: [
         dom('input', { key: 'input' }),
         dom('button', { key: 'button' }),
       ]
     });
     const input = root.querySelector('input');
     const button = root.querySelector('button');
     up(root, { 
       children: [
         dom('button', { key: 'button' }),
         dom('input', { key: 'input' }),
       ]
     })
     expect(root.childNodes[0]).toBe(button);
     expect(root.childNodes[1]).toBe(input);
     expect(root.childNodes.length).toBe(2);
    });
  });
});
