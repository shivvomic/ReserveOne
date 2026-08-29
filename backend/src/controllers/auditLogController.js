const asyncHandler = require('../utils/asyncHandler');
const { getAuditLogs, getAuditLogCount } = require('../database/auditLogQueries');

const PAGE_SIZE = 10;
const VALID_ACTIONS = ['APPROVE', 'REJECT', 'MODIFY'];

const listAuditLogs = asyncHandler(async (req, res) => {
  const { action } = req.query;
  const filterAction = VALID_ACTIONS.includes(action) ? action : undefined;

  const page = Math.max(1, Number(req.query.page) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const [logs, totalCount] = await Promise.all([
    getAuditLogs({ action: filterAction, limit: PAGE_SIZE, offset }),
    getAuditLogCount({ action: filterAction }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  res.json({
    success: true,
    message: 'Audit logs retrieved',
    data: { logs, totalCount, page, totalPages },
  });
});

module.exports = { listAuditLogs };