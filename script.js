(() => {
  'use strict';
  const STORAGE_KEY = 'studyflow.tasks.v1';
  const $ = (id) => document.getElementById(id);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const localDate = (date) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  const todayString = localDate(today);
  $('today-label').textContent = new Intl.DateTimeFormat('en', { weekday:'long', month:'long', day:'numeric' }).format(new Date()).toUpperCase();
  let tasks = loadTasks();
  let activeFilter = 'all';
  let activeCategory = 'All';
  let toastTimer;

  function loadTasks() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (Array.isArray(stored)) return stored;
    } catch (error) { console.warn('Could not read saved tasks.', error); }
    return [
      {id:'demo-1', title:'Review linked lists and stacks', category:'Study', subject:'Data Structures', deadline:todayString, priority:'High', notes:'Revise key operations and practise a few examples.', completed:false, createdAt:Date.now()-3000},
      {id:'demo-2', title:'Prepare Python mini project outline', category:'Project', subject:'Python Programming', deadline:addDays(today,2), priority:'Medium', notes:'Write the goal, features, and tools to use.', completed:false, createdAt:Date.now()-2000},
      {id:'demo-3', title:'Organize sessional notes', category:'Assignment', subject:'Digital Electronics', deadline:addDays(today,4), priority:'Low', notes:'Group notes unit by unit for quick revision.', completed:true, createdAt:Date.now()-1000}
    ];
  }
  function addDays(date, days) { const copy = new Date(date); copy.setDate(copy.getDate()+days); return localDate(copy); }
  function save() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); } catch (error) { showToast('Could not save in this browser.'); } }
  function escapeHTML(value='') { return String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }
  function formatDate(value) {
    if (!value) return 'No deadline';
    const date = new Date(`${value}T00:00:00`);
    if (value === todayString) return 'Due today';
    if (value < todayString) return `Overdue · ${new Intl.DateTimeFormat('en',{month:'short',day:'numeric'}).format(date)}`;
    return new Intl.DateTimeFormat('en',{month:'short',day:'numeric'}).format(date);
  }
  function isToday(task) { return task.deadline === todayString && !task.completed; }
  function visibleTasks() {
    const query = $('search-input').value.trim().toLowerCase();
    return tasks.filter(task => {
      if (activeFilter === 'today' && !isToday(task)) return false;
      if (activeFilter === 'upcoming' && (task.completed || !task.deadline || task.deadline <= todayString)) return false;
      if (activeFilter === 'completed' && !task.completed) return false;
      if (activeCategory !== 'All' && task.category !== activeCategory) return false;
      return !query || [task.title,task.subject,task.notes,task.category].some(value => String(value||'').toLowerCase().includes(query));
    }).sort((a,b) => {
      const mode = $('sort-select').value;
      if (mode === 'priority') return ({High:0,Medium:1,Low:2}[a.priority] ?? 1)-({High:0,Medium:1,Low:2}[b.priority] ?? 1);
      if (mode === 'created') return (b.createdAt||0)-(a.createdAt||0);
      return (a.deadline||'9999').localeCompare(b.deadline||'9999');
    });
  }
  function render() {
    const total = tasks.length, completed = tasks.filter(t=>t.completed).length, inProgress = total-completed, dueToday = tasks.filter(isToday).length;
    const percent = total ? Math.round(completed/total*100) : 0;
    $('total-count').textContent=total; $('progress-count').textContent=inProgress; $('today-count').textContent=dueToday; $('completed-count').textContent=completed;
    $('completion-caption').textContent = total ? `${percent}% of all tasks finished` : 'Every step counts';
    $('progress-percent').textContent=`${percent}%`; $('progress-ring').style.setProperty('--progress',`${percent}%`);
    $('progress-description').textContent = total ? `${completed} of ${total} tasks completed. ${percent===100?'Amazing work — everything is done!':'Keep going, one task at a time.'}` : 'Add a task to start building your study streak.';
    $('side-progress').style.width=`${percent}%`; $('side-progress-label').textContent=`${percent}% completed`;
    const headings={all:'All tasks',today:'Due today',upcoming:'Upcoming tasks',completed:'Completed tasks'};
    $('list-heading').childNodes[0].textContent = `${headings[activeFilter]} `;
    document.querySelectorAll('.nav-item').forEach(button=>button.classList.toggle('active',button.dataset.filter===activeFilter));
    document.querySelectorAll('.chip').forEach(button=>button.classList.toggle('active',button.dataset.category===activeCategory));
    const list = visibleTasks(); $('list-count').textContent=list.length;
    $('task-list').innerHTML = list.map(task => {
      const dueClass = task.deadline && task.deadline < todayString && !task.completed ? ' overdue' : '';
      return `<article class="task-card${task.completed?' is-complete':''}" data-id="${escapeHTML(task.id)}">
        <input class="task-check" type="checkbox" aria-label="Mark ${escapeHTML(task.title)} completed" data-action="toggle" ${task.completed?'checked':''}>
        <div class="task-main"><div class="task-title-line"><span class="task-title">${escapeHTML(task.title)}</span><span class="task-tag">${escapeHTML(task.category)}</span><span class="priority-tag ${String(task.priority||'Medium').toLowerCase()}">${escapeHTML(task.priority||'Medium')}</span></div>
        <div class="task-meta"><span>▤ ${escapeHTML(task.subject||'General')}</span><span class="${dueClass}">◷ ${escapeHTML(formatDate(task.deadline))}</span></div>${task.notes?`<p class="task-notes">${escapeHTML(task.notes)}</p>`:''}</div>
        <div class="task-actions"><button class="icon-btn" data-action="edit" aria-label="Edit ${escapeHTML(task.title)}" title="Edit task">✎</button><button class="icon-btn" data-action="delete" aria-label="Delete ${escapeHTML(task.title)}" title="Delete task">⌫</button></div></article>`;
    }).join('');
    $('empty-state').classList.toggle('show',list.length===0); $('task-list').style.display=list.length?'grid':'none';
  }
  function showToast(message) { const toast=$('toast'); toast.textContent=message; toast.classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>toast.classList.remove('show'),2400); }
  function openModal(task=null) {
    $('task-form').reset(); $('task-id').value=task?.id||''; $('modal-title').textContent=task?'Edit task':'Add a new task'; $('save-task').textContent=task?'Save changes':'Save task';
    $('task-title').value=task?.title||''; $('task-category').value=task?.category||'Study'; $('task-subject').value=task?.subject||''; $('task-deadline').value=task?.deadline||todayString; $('task-priority').value=task?.priority||'Medium'; $('task-notes').value=task?.notes||'';
    $('modal-backdrop').hidden=false; setTimeout(()=>$('task-title').focus(),50);
  }
  function closeModal() { $('modal-backdrop').hidden=true; }
  $('open-modal').addEventListener('click',()=>openModal()); $('empty-add').addEventListener('click',()=>openModal()); $('close-modal').addEventListener('click',closeModal); $('cancel-modal').addEventListener('click',closeModal);
  $('modal-backdrop').addEventListener('click',event=>{if(event.target===$('modal-backdrop'))closeModal();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!$('modal-backdrop').hidden)closeModal();});
  $('task-form').addEventListener('submit',event=>{
    event.preventDefault(); const id=$('task-id').value;
    const data={title:$('task-title').value.trim(),category:$('task-category').value,subject:$('task-subject').value.trim(),deadline:$('task-deadline').value,priority:$('task-priority').value,notes:$('task-notes').value.trim()};
    if(!data.title||!data.deadline){showToast('Please add a title and deadline.');return;}
    if(id){tasks=tasks.map(task=>task.id===id?{...task,...data}:task);showToast('Task updated successfully.');}
    else {tasks.push({id:`task-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,...data,completed:false,createdAt:Date.now()});showToast('Task added. You’ve got this!');}
    save();render();closeModal();
  });
  $('task-list').addEventListener('click',event=>{
    const button=event.target.closest('[data-action]'); if(!button)return;
    const card=button.closest('.task-card'); const task=tasks.find(item=>item.id===card?.dataset.id); if(!task)return;
    const action=button.dataset.action;
    if(action==='toggle'){task.completed=button.checked;save();render();showToast(task.completed?'Task completed — nice work!':'Task marked as in progress.');}
    if(action==='edit')openModal(task);
    if(action==='delete'){if(!confirm(`Delete “${task.title}”?`))return;tasks=tasks.filter(item=>item.id!==task.id);save();render();showToast('Task deleted.');}
  });
  document.querySelectorAll('.nav-item').forEach(button=>button.addEventListener('click',()=>{activeFilter=button.dataset.filter;render();}));
  document.querySelectorAll('.chip').forEach(button=>button.addEventListener('click',()=>{activeCategory=button.dataset.category;render();}));
  $('search-input').addEventListener('input',render); $('sort-select').addEventListener('change',render);
  save(); render();
})();
