import { up, dom } from ".";

const TodoItem = (todo: string) => el('li').setChildren([text(todo)]);

function TodoApp(node: HTMLElement) {
  const input = el('input').withAttributes({
    type: 'text',
  });
  const list = el('ul');
  const addTodo = () => {
    list.appendChild(TodoItem(input.value));
    input.value = '';
  };

  domchain(node).setChildren([
    el('h1').setChildren([
      text('To do list')
    ]),
    input,
    list,
    el('button').setChildren([
      text('New!')
    ]).on({
      click: addTodo
    })
  ])
}

TodoApp(document.body);