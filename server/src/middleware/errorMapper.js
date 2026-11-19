/**
 * MySQL Error Mapper Middleware
 * Translates MySQL error codes and constraints into friendly messages.
 * The database remains the definitive source of truth.
 */

function mapMySQLError(err) {
  if (!err) return { status: 500, message: 'An unexpected internal error occurred.' };

  const errno = err.errno;
  const sqlMessage = err.sqlMessage || err.message || '';

  // 1062: UNIQUE constraint violation
  if (errno === 1062) {
    if (sqlMessage.includes('doctor_id') || sqlMessage.includes('appointment_date') || sqlMessage.includes('appointment_time') || sqlMessage.includes('appointment')) {
      return {
        status: 409,
        code: 'SLOT_TAKEN',
        message: 'This doctor is already booked at that time. Please choose another slot.'
      };
    }
    if (sqlMessage.includes('prescription')) {
      return {
        status: 409,
        code: 'DUPLICATE_PRESCRIPTION',
        message: 'A prescription has already been created for this appointment.'
      };
    }
    if (sqlMessage.includes('license_no')) {
      return {
        status: 409,
        code: 'DUPLICATE_LICENSE',
        message: 'A doctor with this medical license number already exists.'
      };
    }
    if (sqlMessage.includes('email')) {
      return {
        status: 409,
        code: 'DUPLICATE_EMAIL',
        message: 'A record with this email address already exists.'
      };
    }
    if (sqlMessage.includes('phone')) {
      return {
        status: 409,
        code: 'DUPLICATE_PHONE',
        message: 'This phone number is already registered.'
      };
    }
    if (sqlMessage.includes('head_doctor_id')) {
      return {
        status: 409,
        code: 'DUPLICATE_HEAD_DOCTOR',
        message: 'This doctor is already assigned as head of another department.'
      };
    }
    if (sqlMessage.includes('national_id')) {
      return {
        status: 409,
        code: 'DUPLICATE_NATIONAL_ID',
        message: 'A patient with this national ID already exists.'
      };
    }
    return {
      status: 409,
      code: 'DUPLICATE_ENTRY',
      message: 'A duplicate entry was detected for a unique field.',
      detail: sqlMessage
    };
  }

  // 1452: Foreign key violation on insert/update
  if (errno === 1452) {
    return {
      status: 400,
      code: 'FK_NOT_FOUND',
      message: 'The selected record does not exist in the database (invalid foreign key reference).',
      detail: sqlMessage
    };
  }

  // 1451: Foreign key RESTRICT on delete
  if (errno === 1451) {
    return {
      status: 409,
      code: 'FK_RESTRICT',
      message: "Can't delete: this record is still referenced elsewhere in the system (e.g. appointments, bills, or medical records).",
      detail: sqlMessage
    };
  }

  // 3819: CHECK constraint violation
  if (errno === 3819) {
    const msgLower = sqlMessage.toLowerCase();
    if (msgLower.includes('consultation_fee') || msgLower.includes('fee')) {
      return { status: 400, code: 'CHECK_FEE', message: 'Consultation fee cannot be negative.' };
    }
    if (msgLower.includes('amount') || msgLower.includes('zero payment') || msgLower.includes('amount > 0')) {
      return { status: 400, code: 'CHECK_PAYMENT_AMOUNT', message: 'Payment amount must be greater than zero.' };
    }
    if (msgLower.includes('stock_quantity')) {
      return { status: 400, code: 'CHECK_STOCK', message: 'Insufficient medicine stock available (cannot be negative).' };
    }
    if (msgLower.includes('discharge_date')) {
      return { status: 400, code: 'CHECK_DISCHARGE_DATE', message: 'Discharge date cannot be earlier than admission date.' };
    }
    if (msgLower.includes('home_latitude') || msgLower.includes('latitude')) {
      return { status: 400, code: 'CHECK_LATITUDE', message: 'Latitude must be between -90 and 90 degrees.' };
    }
    if (msgLower.includes('home_longitude') || msgLower.includes('longitude')) {
      return { status: 400, code: 'CHECK_LONGITUDE', message: 'Longitude must be between -180 and 180 degrees.' };
    }
    if (msgLower.includes('status')) {
      return { status: 400, code: 'CHECK_STATUS', message: 'Invalid status specified for this record.' };
    }
    if (msgLower.includes('payment_mode')) {
      return { status: 400, code: 'CHECK_PAYMENT_MODE', message: 'Invalid payment mode specified.' };
    }
    if (msgLower.includes('appointment_id is not null or admission_id is not null')) {
      return { status: 400, code: 'CHECK_BILL_TARGET', message: 'A bill must be associated with an appointment OR an admission.' };
    }
    return {
      status: 400,
      code: 'CHECK_VIOLATION',
      message: 'Input violated a database check constraint.',
      detail: sqlMessage
    };
  }

  // 3140: Invalid JSON
  if (errno === 3140) {
    return {
      status: 400,
      code: 'INVALID_JSON',
      message: 'Medical profile or extra results is not valid JSON data.',
      detail: sqlMessage
    };
  }

  return {
    status: 500,
    code: 'DB_ERROR',
    message: sqlMessage || 'Database operation failed.',
    errno
  };
}

function errorHandler(err, req, res, next) {
  console.error('[Error Handler]', err);
  const mapped = mapMySQLError(err);
  res.status(mapped.status).json(mapped);
}

module.exports = {
  mapMySQLError,
  errorHandler
};
