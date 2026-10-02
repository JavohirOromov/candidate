// PART 1 — implement the functions below. See TASK_*.md for the exact rules.
// You may add helper functions and use anything from ./utils.js.

const { parseODataDate, normalizeEquipmentId } = require('./utils');

const CLOSED_STATUSES = ['TECO', 'CLSD'];

const isBlank = (value) => value === undefined || value === null || String(value).trim() === '';

// SystemStatus may hold several statuses separated by spaces, e.g. "REL TECO".
function isOpen(order) {
  const statuses = (order.SystemStatus || '').split(/\s+/);
  return !statuses.some((status) => CLOSED_STATUSES.includes(status));
}

// Numeric priority; an empty priority goes last.
function priorityValue(order) {
  return isBlank(order.Priority) ? Infinity : Number(order.Priority);
}

function compareOrders(a, b) {
  const byPriority = priorityValue(a) - priorityValue(b);
  if (byPriority !== 0 && !Number.isNaN(byPriority)) return byPriority;
  const byDate = parseODataDate(a.BasicStartDate) - parseODataDate(b.BasicStartDate);
  if (byDate !== 0) return byDate;
  return a.OrderId.localeCompare(b.OrderId);
}

/**
 * Open orders of a plant, sorted.
 * @param {object[]} orders  - orders as in data/orders.json (d.results)
 * @param {string} plant     - e.g. "1000"
 * @returns {object[]}
 */
function getOpenOrders(orders, plant) {
  return orders.filter((order) => order.Plant === plant && isOpen(order)).sort(compareOrders);
}

/**
 * Number of notifications per equipment.
 * @param {object[]} notifications
 * @returns {Object<string, number>}  e.g. { "000000000010000101": 3 }
 */
function countNotificationsByEquipment(notifications) {
  const counts = {};
  for (const { EquipmentId } of notifications) {
    if (isBlank(EquipmentId)) continue;
    const key = normalizeEquipmentId(EquipmentId);
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}

function hasInvalidDates(notification) {
  const { MalfunctionStart, MalfunctionEnd } = notification;
  const start = isBlank(MalfunctionStart) ? null : new Date(MalfunctionStart);
  const end = isBlank(MalfunctionEnd) ? null : new Date(MalfunctionEnd);
  if ([start, end].some((date) => date && Number.isNaN(date.getTime()))) return true;
  return Boolean(start && end && start > end);
}

/**
 * Validates a new notification before it is saved.
 * @param {object} notification  - see TASK_*.md for the fields
 * @param {object[]} equipmentList
 * @param {object} config        - result of loadConfig(plant)
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateNotification(notification, equipmentList, config) {
  const { requiredFields, descriptionMaxLength } = config.notification;
  const errors = [];

  for (const field of requiredFields) {
    if (isBlank(notification[field])) errors.push(`REQUIRED:${field}`);
  }

  if (String(notification.Description || '').length > descriptionMaxLength) {
    errors.push('DESCRIPTION_TOO_LONG');
  }

  if (hasInvalidDates(notification)) errors.push('DATES_INVALID');

  if (!isBlank(notification.EquipmentId)) {
    const id = normalizeEquipmentId(notification.EquipmentId);
    const found = equipmentList.some((equipment) => normalizeEquipmentId(equipment.EquipmentId) === id);
    if (!found) errors.push('EQUIPMENT_NOT_FOUND');
  }

  return { valid: errors.length === 0, errors };
}

module.exports = { getOpenOrders, countNotificationsByEquipment, validateNotification };
