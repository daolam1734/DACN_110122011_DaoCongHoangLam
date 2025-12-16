import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
// load .env from current working directory (backend when running backend scripts)
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
    dialect: 'postgres',
    // Enable SQL logging when SEQ_LOG=true in .env (useful for debugging)
    logging: process.env.SEQ_LOG === 'true' ? (msg) => console.log('[sequelize]', msg) : false,
    dialectOptions: {
      // ssl: true, // Uncomment if using SSL
    },
    define: {
      freezeTableName: true,
      timestamps: true,
    },
  }
);

// Global Sequelize hooks to write audit entries for all create/update/delete operations.
// This records business data changes into AUDIT_HE_THONG. It is best-effort and will
// not block the main operation if audit insert fails.
sequelize.addHook('beforeUpdate', (instance, options) => {
  try {
    // store previous values for later use in afterUpdate
    instance._audit_old = instance._previousDataValues || null
  } catch (err) {
    // ignore
  }
})

sequelize.addHook('afterCreate', async (instance, options) => {
  try {
    const Audit = sequelize.models && sequelize.models.AuditHeThong
    if (!Audit) return
    const tableName = (instance.constructor && (instance.constructor.getTableName ? instance.constructor.getTableName() : instance.constructor.tableName)) || instance.constructor.name
    const pkAttrs = instance.constructor && instance.constructor.primaryKeyAttributes ? instance.constructor.primaryKeyAttributes : []
    const pk = pkAttrs.length ? instance.get(pkAttrs[0]) : null
    const newData = instance.get ? instance.get({ plain: true }) : null
    const payload = {
      ten_bang: tableName,
      khoa_chinh: pk ? String(pk) : null,
      hanh_dong: 'CREATE',
      du_lieu_cu: null,
      du_lieu_moi: newData,
      nguoi_thuc_hien: options && (options.userId || (options.user && options.user.id)) ? (options.userId || (options.user && options.user.id)) : null
    }
    await Audit.create(payload, { transaction: options && options.transaction ? options.transaction : undefined })
  } catch (err) {
    console.error('[sequelize.audits] afterCreate error', err && err.message ? err.message : err)
  }
})

sequelize.addHook('afterUpdate', async (instance, options) => {
  try {
    const Audit = sequelize.models && sequelize.models.AuditHeThong
    if (!Audit) return
    const tableName = (instance.constructor && (instance.constructor.getTableName ? instance.constructor.getTableName() : instance.constructor.tableName)) || instance.constructor.name
    const pkAttrs = instance.constructor && instance.constructor.primaryKeyAttributes ? instance.constructor.primaryKeyAttributes : []
    const pk = pkAttrs.length ? instance.get(pkAttrs[0]) : null
    const oldData = instance._audit_old || instance._previousDataValues || null
    const newData = instance.get ? instance.get({ plain: true }) : null
    const payload = {
      ten_bang: tableName,
      khoa_chinh: pk ? String(pk) : null,
      hanh_dong: 'UPDATE',
      du_lieu_cu: oldData,
      du_lieu_moi: newData,
      nguoi_thuc_hien: options && (options.userId || (options.user && options.user.id)) ? (options.userId || (options.user && options.user.id)) : null
    }
    await Audit.create(payload, { transaction: options && options.transaction ? options.transaction : undefined })
  } catch (err) {
    console.error('[sequelize.audits] afterUpdate error', err && err.message ? err.message : err)
  }
})

sequelize.addHook('afterDestroy', async (instance, options) => {
  try {
    const Audit = sequelize.models && sequelize.models.AuditHeThong
    if (!Audit) return
    const tableName = (instance.constructor && (instance.constructor.getTableName ? instance.constructor.getTableName() : instance.constructor.tableName)) || instance.constructor.name
    const pkAttrs = instance.constructor && instance.constructor.primaryKeyAttributes ? instance.constructor.primaryKeyAttributes : []
    const pk = pkAttrs.length ? instance.get(pkAttrs[0]) : null
    const oldData = instance._previousDataValues || null
    const payload = {
      ten_bang: tableName,
      khoa_chinh: pk ? String(pk) : null,
      hanh_dong: 'DELETE',
      du_lieu_cu: oldData,
      du_lieu_moi: null,
      nguoi_thuc_hien: options && (options.userId || (options.user && options.user.id)) ? (options.userId || (options.user && options.user.id)) : null
    }
    await Audit.create(payload, { transaction: options && options.transaction ? options.transaction : undefined })
  } catch (err) {
    console.error('[sequelize.audits] afterDestroy error', err && err.message ? err.message : err)
  }
})

export default sequelize;
