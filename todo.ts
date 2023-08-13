import { cmp, dom, up } from ".";

const STORAGE_KEY = "todos-redom";
const todoStorage = {
  fetch: () => JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"),
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
  const toggle = dom("input", {
    className: "toggle",
    type: "checkbox",
    on: {
      change: (e) =>
        props.onChange({ ...props.item, done: e.currentTarget.checked }),
    },
  });
  const label = dom("label", {});
  const root = dom("li", {
    className: "todo",
    on: {
      dblclick: () => root.current.classList.add("editing"),
    },
    children: [
      dom("div", {
        className: "view",
        children: [
          toggle,
          label,
          dom("button", {
            className: "destroy",
            on: {
              click: () => props.remove(),
            },
          }),
        ],
      }),
      dom("form", {
        on: {
          submit: (e) => {
            e.preventDefault();
            const title = new FormData(e.currentTarget).get("title") as string;
            props.onChange({ ...props.item, title });
            root.current.classList.remove("editing");
          },
        },
        children: [
          dom("input", {
            className: "edit",
            type: "text",
            name: "title",
          }),
        ],
      }),
    ],
  });
  return (nextProps: TodoProps) => {
    props = nextProps;
    up(toggle.current, { checked: props.item.done });
    up(label.current, { children: [props.item.title] });
    return root;
  };
};

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
    up(counter.current, { children: [String(visible.length)] });
    up(todoList.current, {
      children: visible.map((item) =>
        cmp(Todo, {
          item,
          remove: () => removeItem(item),
          onChange: (v) => Object.assign(item, v),
          key: item.title,
        }),
      ),
    });
  };
  const removeItem = (item: TodoItem) => {
    data = data.filter((d) => d !== item);
    update();
  };
  const addItem = (item: TodoItem) => {
    data.unshift(item);
    update();
  };
  const toggleAll = () => {
    const allDone = data.every((d) => d.done);
    data.forEach((d) => (d.done = !allDone));
    update();
  };
  const clearCompleted = () => {
    data = data.filter((d) => !d.done);
    update();
  };

  const createInput = dom("input", {
    className: "new-todo",
    type: "text",
    placeholder: "What needs to be done?",
  });
  const todoList = dom("ul", { className: "todo-list" });
  const counter = dom("strong", { children: ["0"] });

  const Filter = (label: string, value: keyof typeof filters) =>
    dom("li", {
      children: [
        dom("label", {
          children: [
            dom("input", {
              type: "radio",
              value,
              name: "filter",
              on: {
                click: () => {
                  filter = filters[value];
                  update();
                },
              },
            }),
            label,
          ],
        }),
      ],
    });

  return [
    dom("section", {
      className: "todoapp",
      children: [
        dom("header", {
          className: "header",
          children: [
            dom("h1", { className: "heading", children: ["todos"] }),
            dom("form", {
              on: {
                submit: (evt) => {
                  evt.preventDefault();
                  const item = {
                    done: false,
                    title: createInput.current.value,
                  };
                  createInput.current.value = "";
                  addItem(item);
                },
              },
              children: [createInput],
            }),
          ],
        }),
        dom("section", {
          className: "main",
          children: [
            dom("input", {
              className: "toggle-all",
              type: "checkbox",
              on: {
                click: toggleAll,
              },
            }),
            dom("label", {
              for: "toggle-all",
              children: ["Mark all as complete"],
            }),
            todoList,
          ],
        }),
        dom("footer", {
          className: "footer",
          children: [
            dom("span", {
              className: "todo-count",
              children: [counter, " items left"],
            }),
            dom("ul", {
              className: "filters",
              children: [
                Filter("All", "all"),
                Filter("Active", "active"),
                Filter("Completed", "completed"),
              ],
            }),
            dom("button", {
              className: "clear-completed",
              on: {
                click: clearCompleted,
              },
              children: ["Clear Completed"],
            }),
          ],
        }),
      ],
    }),
    dom("footer", {
      className: "info",
      children: [
        dom("p", { children: ["Double-click to edit a todo"] }),
        dom("p", {
          children: [
            "Written by ",
            dom("a", {
              href: "https://www.mauroreisvieira.com/",
              children: ["Mauro Reis Vieira"],
            }),
          ],
        }),
        dom("p", {
          children: [
            "Part of ",
            dom("a", {
              href: "http://todomvc.com",
              children: ["TodoMVC"],
            }),
          ],
        }),
      ],
    }),
  ];
};

up(document.body, { children: TodoApp() });
