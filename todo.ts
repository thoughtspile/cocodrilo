import { el, up } from '.';

const STORAGE_KEY = 'todos-redom';
const todoStorage = {
  fetch: () => JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'),
  save: (todos) => {
    // localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  },
};

interface TodoProps {
  item: TodoItem;
  onChange: (item: TodoItem) => void;
  remove: () => void;
}
const Todo = (props: TodoProps) => {
  const item = el('li', { 
    className: 'todo',
    $key: props.item.title,
    on: {
      dblclick: () => item.current.classList.add('editing'),
    }
  }, [
    el('div', { className: 'view', $key: 'view' }, [
      el('input', {
        className: 'toggle',
        type: 'checkbox',
        checked: props.item.done,
        $key: 'toggle',
        on: {
          change: (e) => props.onChange({ ...props.item, done: e.currentTarget.checked }),
        }
      }),
      el('label', {}, [
        props.item.title
      ]),
      el('button', {
        className: 'destroy',
        $key: 'destroy',
        on: {
          click: () => props.remove()
        },
      }),
    ]),
    el('form', {
      $key: 'form',
      on: {
        submit: (e) => {
          e.preventDefault();
          const title = new FormData(e.currentTarget).get('title') as string;
          props.onChange({ ...props.item, title });
          item.classList.remove('editing');
        }
      }
    }, [
      el('input', {
        $key: 'edit',
        class: 'edit',
        type: 'text',
        name: 'title',
      })
    ])
  ]);
  return item;
}

const filters = {
  all: (e: TodoItem) => true,
  active: (e: TodoItem) => e.done,
  completed: (e: TodoItem) => !e.done,
};

type TodoItem = { done: boolean; title: string };
const TodoApp = () => {
  let filter = filters.all;
  let data: [TodoItem, ReturnType<typeof Todo>][] = [];
  const update = () => {
    todoStorage.save(data);
    const visible = data.filter(([props]) => filter(props));
    up(counter.current, {}, [String(visible.length)]);
    up(todoList.current, {}, visible.map(v => v[1]));
  };
  const addItem = (item: TodoItem) => {
    const remove = () => {
      data = data.filter(d => d[0] !== item);
      update();
    };
    const cmp = Todo({ item, remove, onChange: v => Object.assign(item, v) });
    data.push([item, cmp]);
    createInput.current.value = '';
    update();
  };

  const createInput = el('input', {
    class: 'new-todo',
    type: 'text',
    placeholder: 'What needs to be done?',
  });
  const todoList = el('ul', { className: 'todo-list' });
  const counter = el('strong', {}, ['0']);

  const Filter = (label: string, value: keyof typeof filters) => el('li', {}, [
    el('label', {}, [
      el('input', {
        type: 'radio',
        value,
        name: 'filter',
        on: {
          click: () => {
            filter = filters[value];
            update();
          }
        }
      }),
      label
    ])
  ]);

  return [
    el('section', { className: 'todoapp' }, [
      el('header', { className: 'header' }, [
        el('h1', { className: 'heading' }, ['todos']),
        el('form', {
          on: {
            submit: (evt) => {
              evt.preventDefault();
              addItem({ done: false, title: createInput.current.value });
            }
          }
        }, [
          createInput,
        ]),
      ]),
      el('section', { className: 'main' }, [
        el('input', {
          class: 'toggle-all',
          type: 'checkbox',
          on: {
            click: () => {
              const allDone = data.every(d => d[0].done);
              data.forEach(d => d[0].done = !allDone);
            }
          }
        }),
        el('label', {
          for: 'toggle-all',
        }, ['Mark all as complete']),
        todoList,
      ]),
      el('footer', { className: 'footer' }, [
        el('span', { className: 'todo-count' }, [
          counter,
          ' items left',
        ]),
        el('ul', { className: 'filters' }, [
          Filter('All', 'all'),
          Filter('Active', 'active'),
          Filter('Completed', 'completed'),
        ]),
        el('button', { 
          className: 'clear-completed',
          on: {
            click: () => {
              data = data.filter((d) => !d[0].done);
              update();
            }
          }
        }, [
          'Clear Completed'
        ]),
      ])
    ]),
    el('footer', { className: 'info' }, [
      el('p', {}, ['Double-click to edit a todo']),
      el('p', {}, [
        'Written by ',
        el('a', {
          href: 'https://www.mauroreisvieira.com/',
        }, ['Mauro Reis Vieira'])
      ]),
      el('p', {}, [
        'Part of ',
        el('a', {
          href: 'http://todomvc.com',
        }, ['TodoMVC'])
      ]),
    ])
  ];
};

up(document.body, {}, TodoApp());
