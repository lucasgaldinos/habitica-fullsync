---
title: "TODOs"
description: "What is missing for this project. These TODOs **MUST** be refined, as they are only descriptions of what is being done."
created: "{{date}}"
author: "[[Lucas Galdino]]"
tags:
  - "habitica/extensions/obsidian-sync"
  - "habitica/add-ons"
  - "habitica/todos"
  - "habitica/extensions/todos"
links:
  - "[[../../tasks/habitica-fullsync|habitica-fullsync]]"
  - "[[./README|README]]"
  - "[[plan|plan]]"
---

# Todos

- [ ] Current implementation could use `dataview` for organizing tasks instead of a huge list of TODOs or the list + the `dataview` tables.

- [ ] A better extraction and manipulation from the "notes" and "subtasks"

  ````md current-format
  ### To-Dos
  - [ ] Define my daily mantras  [id:: b87ec34b-9aea-4fce-81c8-b416857ff3dd] [priority:: medium] [due:: 2026-05-10]
  - [ ] enviar relatório #focus #data engineering #genetic #self awareness #operational research #programming [id:: 5e0702fc-bd8f-4ae2-9905-52ae7267249e] [priority:: high]
  - [ ] Fazer as matérias EAD #focus #responsibility #urgent [id:: eadb714f-092e-464a-ae47-7acdfeb3b55b] [priority:: high] [due:: 2026-04-30]
  - [ ] criar template do webclipper para as matérias do EAD após fazer a prova  [id:: 1411daf3-cc70-494d-8e02-6342bc25d831] [priority:: high]
  - [ ] fix markdown-formatter skill with `<xml>` tags (ai-skill-creator should reference XML skill for routing)  [id:: 4cfc1d73-1e5f-4b9a-9b3b-928f260be61b] [priority:: low]
  - [ ] Recreate a genetic algorithm kinda barebones at the beginning. (Using only CPU. Main objective is testing new methods, creating a more basic structure that allows for different processes to be used.) #operational research #focus #data engineering #urgent #productivity #short term [id:: 52b3096a-c9f8-4d31-9902-99e1a8d88fce] [priority:: high] [due:: 2026-04-26]
  ````

  Which is clearly not ideal. It's cluttered and confusing.

  + [ ] tags are not maintained if they have hyphens
  + [ ] The "notes" extraction is just inside parenthesis.
  + [ ] checklists do not come together with the extraction.

- [ ] A way to create the tasks from the markdown itself. The current way allows me to sync to finish a task. It does not allow me to create a new task. I think this sync step might be hard, so we have to think it well through.
  + [ ] Define how to create a task from markdown, generating an ID, etc.
  + [ ] define the synchronization mechanism
