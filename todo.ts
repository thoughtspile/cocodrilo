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
    on: {
      dblclick: () => item.current.classList.add('editing'),
    }
  }, [
    el('div', { className: 'view' }, [
      el('input', {
        className: 'toggle',
        type: 'checkbox',
        checked: props.item.done,
        on: {
          change: (e) => props.onChange({ ...props.item, done: e.currentTarget.checked }),
        }
      }),
      el('label', {}, [
        props.item.title
      ]),
      el('button', {
        className: 'destroy',
        on: {
          click: () => props.remove()
        },
      }),
    ]),
    el('form', {
      on: {
        submit: (e) => {
          e.preventDefault();
          const title = new FormData(e.currentTarget).get('title') as string;
          props.onChange({ ...props.item, title });
          item.current.classList.remove('editing');
        }
      }
    }, [
      el('input', {
        className: 'edit',
        type: 'text',
        name: 'title',
      })
    ])
  ]);
  return item;
}

const filters = {
  all: (e: TodoItem) => true,
  active: (e: TodoItem) => !e.done,
  completed: (e: TodoItem) => e.done,
};

type TodoItem = { done: boolean; title: string };
const TodoApp = () => {
  let filter = filters.all;
  let data: TodoItem[] = [];
  const update = () => {
    todoStorage.save(data);
    const visible = data.filter(filter);
    up(counter.current, {}, [String(visible.length)]);
    up(todoList.current, {}, visible.map(item => [
      Todo({ item, remove: () => removeItem(item), onChange: v => Object.assign(item, v) }),
      item.title
    ]));
  };
  const removeItem = (item: TodoItem) => {
    data = data.filter(d => d !== item);
    update();
  };
  const addItem = (item: TodoItem) => {
    data.unshift(item);
    update();
  };
  const toggleAll = () => {
    const allDone = data.every(d => d.done);
    data.forEach(d => d.done = !allDone);
    update();
  };
  const clearCompleted = () => {
    data = data.filter((d) => !d.done);
    update();
  };

  const createInput = el('input', {
    className: 'new-todo',
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
              const item = { done: false, title: createInput.current.value };
              createInput.current.value = '';
              addItem(item);
            }
          }
        }, [
          createInput,
        ]),
      ]),
      el('section', { className: 'main' }, [
        el('input', {
          className: 'toggle-all',
          type: 'checkbox',
          on: {
            click: toggleAll
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
            click: clearCompleted
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
