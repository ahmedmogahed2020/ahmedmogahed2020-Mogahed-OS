import { appState } from '../state.js';
import { safeNumber, todayISO } from '../utils.js';

function normalizeTask(task = {}) {
  return {
    ...task,
    title: task.title || 'مهمة بدون عنوان',
    status: task.status || 'مفتوحة',
    priority: task.priority || 'متوسطة',
    dueDate: task.dueDate || '',
    dueTime: task.dueTime || '',
    reminderMinutes: safeNumber(task.reminderMinutes, 0)
  };
}

function taskDateTime(task = {}) {
  if (!task.dueDate) return null;
  const time = task.dueTime || '23:59';
  const date = new Date(`${task.dueDate}T${time}:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function taskTimeState(task = {}) {
  if (task.status === 'مكتملة') return { key: 'done', label: 'مكتملة', weight: 99 };
  if (!task.dueDate) return { key: 'no-date', label: 'بدون موعد', weight: 50 };
  const today = todayISO();
  const due = taskDateTime(task);
  const diffMinutes = due ? Math.round((due.getTime() - Date.now()) / 60000) : null;
  const lead = Math.max(1, safeNumber(task.reminderMinutes, safeNumber(appState.data.settings?.notifications?.leadMinutes, 10)));
  if (task.dueDate < today || (diffMinutes !== null && diffMinutes < 0)) return { key: 'overdue', label: 'متأخرة', weight: 0 };
  if (task.dueDate === today && task.dueTime && diffMinutes !== null && diffMinutes <= lead) return { key: 'due-soon', label: diffMinutes <= 0 ? 'وقتها الآن' : `بعد ${Math.max(1, diffMinutes)} د`, weight: 1 };
  if (task.dueDate === today && task.dueTime) return { key: 'today-timed', label: `اليوم ${task.dueTime}`, weight: 2 };
  if (task.dueDate === today) return { key: 'today-no-time', label: 'اليوم بدون وقت', weight: 3 };
  return { key: 'upcoming', label: task.dueTime ? `${task.dueDate} · ${task.dueTime}` : task.dueDate, weight: 20 };
}

function priorityWeight(task = {}) {
  if (task.priority === 'عالية') return 0;
  if (task.priority === 'متوسطة') return 1;
  return 2;
}

function sortByFlow(a, b) {
  const sa = taskTimeState(a);
  const sb = taskTimeState(b);
  if (sa.weight !== sb.weight) return sa.weight - sb.weight;
  if (priorityWeight(a) !== priorityWeight(b)) return priorityWeight(a) - priorityWeight(b);
  return String(a.dueTime || '23:59').localeCompare(String(b.dueTime || '23:59')) || String(a.createdAt || '').localeCompare(String(b.createdAt || ''));
}

function taskClosedToday(task = {}) {
  return String(task.completedAt || task.updatedAt || '').slice(0, 10) === todayISO();
}

export function getDailyFlowState() {
  const today = todayISO();
  const tasks = (appState.data.tasks || []).map(normalizeTask);
  const open = tasks.filter(task => task.status !== 'مكتملة');
  const todayTasks = tasks.filter(task => task.dueDate === today || taskClosedToday(task));
  const todayOpen = open.filter(task => task.dueDate === today || !task.dueDate).sort(sortByFlow);
  const todayDone = tasks.filter(task => task.status === 'مكتملة' && (task.dueDate === today || taskClosedToday(task)));
  const overdue = open.filter(task => taskTimeState(task).key === 'overdue').sort(sortByFlow);
  const dueSoon = open.filter(task => ['due-soon', 'today-timed'].includes(taskTimeState(task).key)).sort(sortByFlow);
  const todayNoTime = open.filter(task => taskTimeState(task).key === 'today-no-time').sort(sortByFlow);
  const scheduledToday = open.filter(task => task.dueDate === today && task.dueTime).sort(sortByFlow);
  const primaryTask = [...overdue, ...dueSoon, ...todayNoTime, ...todayOpen].find(Boolean) || null;
  const nextTask = [...dueSoon, ...todayNoTime, ...todayOpen].filter(task => task.id !== primaryTask?.id)[0] || null;
  const todayReview = (appState.data.reviews || []).find(review => review.type === 'يومية' && review.date === today);
  const readyForReview = todayOpen.length === 0 || new Date().getHours() >= 20 || Boolean(todayReview);
  const reviewAction = todayReview
    ? 'راجع مراجعة اليوم أو حوّل أفعالها لمهام.'
    : todayOpen.length
      ? 'اقفل المفتوح أو انقله لبكرة قبل المراجعة.'
      : 'افتح مراجعة اليوم وسجل الخلاصة وخطة بكرة.';
  const summary = overdue.length
    ? `عندك ${overdue.length} مهمة متأخرة. ابدأ بواحدة فقط ثم راجع اليوم.`
    : dueSoon.length
      ? `عندك ${dueSoon.length} مهمة بوقت واضح اليوم. نفذ الأقرب أولًا.`
      : todayOpen.length
        ? `عندك ${todayOpen.length} مهمة مفتوحة اليوم. اختار أهم واحدة.`
        : 'اليوم جاهز للمراجعة. اقفل اليوم وخطط لبكرة.';
  return {
    today,
    tasks,
    open,
    todayTasks,
    todayOpen,
    todayDone,
    overdue,
    dueSoon,
    todayNoTime,
    scheduledToday,
    primaryTask,
    nextTask,
    todayReview,
    readyForReview,
    reviewAction,
    summary,
    timeState: primaryTask ? taskTimeState(primaryTask) : { key: 'empty', label: 'لا توجد مهمة', weight: 100 }
  };
}
