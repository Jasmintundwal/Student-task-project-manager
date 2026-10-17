# StudyFlow — Student Task & Project Manager

StudyFlow is a responsive task manager made for students. It helps organize assignments, study sessions, personal tasks, and college projects in one simple dashboard.

## Features

- Create, edit, and delete tasks
- Add task category, subject/project, deadline, priority, and notes
- Mark tasks as complete or in progress
- Dashboard statistics and completion progress
- Views for all tasks, due today, upcoming, and completed
- Search tasks and filter by category
- Sort by deadline, priority, or recently added
- Automatically saves tasks in browser `localStorage`
- Responsive layout for desktop and mobile
- Includes a few sample tasks on first launch; edit or delete them as you like

## Tech stack

- HTML5
- CSS3
- Vanilla JavaScript
- Browser localStorage (no server or database setup required)

## Run the project

1. Download or clone this repository.
2. Open the `student-task-project-manager` folder.
3. Double-click `index.html` to open it in a browser.

You can also open the folder in Visual Studio Code and use the Live Server extension if you have it installed. **No terminal commands, npm, or extra packages are required.**

## Project structure

```text
student-task-project-manager/
├── index.html   # App layout and task form
├── style.css    # Responsive styling
├── script.js    # Task logic and local storage
├── README.md    # Project documentation
└── .gitignore   # Common files to ignore
```

## Data and privacy

Tasks are stored in the current browser on the current device. They are not synced to another device and are not sent to a server. Clearing browser data may remove saved tasks. This demo does not include user accounts or a shared online database.

## Future improvements

- Login and individual student accounts
- Backend API with Java / Spring Boot
- SQL database for persistent, cross-device task storage
- Project collaboration and task assignment to teammates
- Calendar view, reminders, and export options

## GitHub upload

Create a new repository on GitHub, then upload these project files using GitHub's **Add file → Upload files** option. Keep this README in the repository so visitors understand the project.

## License

This project is available under the MIT License. See `LICENSE`.
