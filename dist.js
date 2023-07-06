(() => {
  // index.ts
  function setChildren(target, childList) {
    let first = null;
    childList.forEach((c) => {
      const child = typeof c === "function" ? c(target) : c;
      if (!child)
        return;
      const node = child instanceof Node ? child : text(child);
      target.appendChild(node);
      !first && (first = node);
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
      if (key === "key") {
      } else if (key === "on") {
        updateEvents(node, newValue);
      } else if (key === "style") {
        Object.assign(node[key], newValue);
      } else if (key === "$key") {
        node.setAttribute("data-key", newValue);
      } else if (key !== "list" && key !== "form" && key in node) {
        node[key] = newValue;
      } else if (typeof newValue === "string") {
        node.setAttribute(key, newValue);
      } else {
        node.removeAttribute(key);
      }
    });
  }
  function el(tag, props = {}, children = []) {
    function build(parent) {
      const match = props.$key && parent.querySelector(`${tag}[data-key="${props.$key}"]`);
      const node = match || document.createElement(tag, { is: props.is });
      build["current"] = node;
      up(node, props, children);
      return node;
    }
    return build;
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
      $key: props.item.title,
      on: {
        dblclick: () => item.current.classList.add("editing")
      }
    }, [
      el("div", { className: "view", $key: "view" }, [
        el("input", {
          className: "toggle",
          type: "checkbox",
          checked: props.item.done,
          $key: "toggle",
          on: {
            change: (e) => props.onChange({ ...props.item, done: e.currentTarget.checked })
          }
        }),
        el("label", {}, [
          props.item.title
        ]),
        el("button", {
          className: "destroy",
          $key: "destroy",
          on: {
            click: () => props.remove()
          }
        })
      ]),
      el("form", {
        $key: "form",
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
          $key: "edit",
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
      up(todoList.current, {}, visible.map((item) => {
        return Todo({ item, remove: () => removeItem(item), onChange: (v) => Object.assign(item, v) });
      }));
    };
    const removeItem = (item) => {
      data = data.filter((d) => d !== item);
      update();
    };
    const addItem = (item) => {
      data.push(item);
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
