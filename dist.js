(() => {
  // index.ts
  function setChildren(target, childList) {
    let first = null;
    let implicitKey = 0;
    const oldKeyed = target.keyed || {};
    const newKeyed = target.keyed = {};
    childList.forEach((raw) => {
      const isKeyed = Array.isArray(raw);
      const c = isKeyed ? raw[0] : raw;
      const key = isKeyed ? raw[1] : implicitKey++;
      const child = typeof c === "function" ? c(oldKeyed[key]) : c;
      if (child) {
        const node = child instanceof Node ? child : text(child);
        newKeyed[key] = node;
        target.appendChild(node);
        first = first || node;
      }
    });
    while (target.firstChild !== first)
      target.removeChild(target.firstChild);
  }
  function updateEvents(node, events) {
    const cache = node.events || (node.events = {});
    Object.entries(events).forEach(([event, listener]) => {
      cache[event] && node.removeEventListener(event, cache[event]);
      (cache[event] = listener) && node.addEventListener(event, listener);
    });
  }
  function assign(node, props) {
    Object.entries(props).forEach(([key, newValue]) => {
      if (key === "on") {
        updateEvents(node, newValue);
      } else if (key === "style") {
        Object.assign(node[key], newValue);
      } else if (key !== "list" && key !== "form" && key in node) {
        node[key] = newValue;
      } else if (typeof newValue === "string") {
        node.setAttribute(key, newValue);
      } else {
        node.removeAttribute(key);
      }
    });
  }
  function el(tag, props = {}, children) {
    return function build(prev) {
      const node = prev || document.createElement(tag);
      build["current"] = node;
      up(node, props, children);
      return node;
    };
  }
  function up(node, props = {}, children) {
    assign(node, props);
    children && setChildren(node, children);
  }
  function text(text2) {
    return document.createTextNode(text2);
  }

  // todo.ts
  var STORAGE_KEY = "todos-redom";
  var todoStorage = {
    fetch: () => JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"),
    save: (todos) => {
    }
  };
  var Todo = (props) => {
    const item = el("li", {
      className: "todo",
      on: {
        dblclick: () => item.current.classList.add("editing")
      }
    }, [
      el("div", { className: "view" }, [
        el("input", {
          className: "toggle",
          type: "checkbox",
          checked: props.item.done,
          on: {
            change: (e) => props.onChange({ ...props.item, done: e.currentTarget.checked })
          }
        }),
        el("label", {}, [
          props.item.title
        ]),
        el("button", {
          className: "destroy",
          on: {
            click: () => props.remove()
          }
        })
      ]),
      el("form", {
        on: {
          submit: (e) => {
            e.preventDefault();
            const title = new FormData(e.currentTarget).get("title");
            props.onChange({ ...props.item, title });
            item.current.classList.remove("editing");
          }
        }
      }, [
        el("input", {
          className: "edit",
          type: "text",
          name: "title"
        })
      ])
    ]);
    return item;
  };
  var filters = {
    all: (e) => true,
    active: (e) => !e.done,
    completed: (e) => e.done
  };
  var TodoApp = () => {
    let filter = filters.all;
    let data = [];
    const update = () => {
      todoStorage.save(data);
      const visible = data.filter(filter);
      up(counter.current, {}, [String(visible.length)]);
      up(todoList.current, {}, visible.map((item) => [
        Todo({ item, remove: () => removeItem(item), onChange: (v) => Object.assign(item, v) }),
        item.title
      ]));
    };
    const removeItem = (item) => {
      data = data.filter((d) => d !== item);
      update();
    };
    const addItem = (item) => {
      data.unshift(item);
      update();
    };
    const toggleAll = () => {
      const allDone = data.every((d) => d.done);
      data.forEach((d) => d.done = !allDone);
      update();
    };
    const clearCompleted = () => {
      data = data.filter((d) => !d.done);
      update();
    };
    const createInput = el("input", {
      className: "new-todo",
      type: "text",
      placeholder: "What needs to be done?"
    });
    const todoList = el("ul", { className: "todo-list" });
    const counter = el("strong", {}, ["0"]);
    const Filter = (label, value) => el("li", {}, [
      el("label", {}, [
        el("input", {
          type: "radio",
          value,
          name: "filter",
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
      el("section", { className: "todoapp" }, [
        el("header", { className: "header" }, [
          el("h1", { className: "heading" }, ["todos"]),
          el("form", {
            on: {
              submit: (evt) => {
                evt.preventDefault();
                const item = { done: false, title: createInput.current.value };
                createInput.current.value = "";
                addItem(item);
              }
            }
          }, [
            createInput
          ])
        ]),
        el("section", { className: "main" }, [
          el("input", {
            className: "toggle-all",
            type: "checkbox",
            on: {
              click: toggleAll
            }
          }),
          el("label", {
            for: "toggle-all"
          }, ["Mark all as complete"]),
          todoList
        ]),
        el("footer", { className: "footer" }, [
          el("span", { className: "todo-count" }, [
            counter,
            " items left"
          ]),
          el("ul", { className: "filters" }, [
            Filter("All", "all"),
            Filter("Active", "active"),
            Filter("Completed", "completed")
          ]),
          el("button", {
            className: "clear-completed",
            on: {
              click: clearCompleted
            }
          }, [
            "Clear Completed"
          ])
        ])
      ]),
      el("footer", { className: "info" }, [
        el("p", {}, ["Double-click to edit a todo"]),
        el("p", {}, [
          "Written by ",
          el("a", {
            href: "https://www.mauroreisvieira.com/"
          }, ["Mauro Reis Vieira"])
        ]),
        el("p", {}, [
          "Part of ",
          el("a", {
            href: "http://todomvc.com"
          }, ["TodoMVC"])
        ])
      ])
    ];
  };
  up(document.body, {}, TodoApp());
})();
