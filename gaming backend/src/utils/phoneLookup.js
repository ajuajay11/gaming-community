/**
 * Phone strings in the DB may use +91…, 91…, or a 10-digit local number. Users
 * can type any of these; exact-string findOne would miss and allow OTP + verify
 * to proceed until register. These variants are used only for lookups, not
 * for Redis OTP keys (those stay tied to the request body).
 */
function phoneVariants(raw) {
  if (raw == null || raw === "") return [];
  const t = String(raw).trim().replace(/\s/g, "");
  if (!t) return [];
  const variants = new Set([t]);
  const digits = t.startsWith("+") ? t.slice(1) : t;
  variants.add(digits);
  variants.add(`+${digits}`);
  if (/^[6-9]\d{9}$/.test(digits)) {
    variants.add(`91${digits}`);
    variants.add(`+91${digits}`);
  }
  if (/^91[6-9]\d{9}$/.test(digits)) {
    const local = digits.slice(2);
    variants.add(local);
    variants.add(`+91${local}`);
    variants.add(`91${local}`);
  }
  return [...variants];
}

/** Mongo filter when resolving by email and/or phone (xor in routes). */
function buildUserLookupQuery(email, phone) {
  const clauses = [];
  const emailNorm = email != null && String(email).trim() ? String(email).toLowerCase().trim() : "";
  if (emailNorm) clauses.push({ email: emailNorm });

  const phoneNorm = phone != null && String(phone).trim() ? String(phone).trim() : "";
  if (phoneNorm) {
    const vars = phoneVariants(phoneNorm);
    if (vars.length === 1) clauses.push({ phone: vars[0] });
    else if (vars.length > 1) clauses.push({ phone: { $in: vars } });
  }
  if (clauses.length === 0) return null;
  if (clauses.length === 1) return clauses[0];
  return { $or: clauses };
}

/**
 * Resolve a user id by email/phone using the raw Mongo collection so Mongoose
 * strict/cast query handling cannot turn the filter into {} and accidentally
 * match the first document in the collection.
 */
async function findUserIdByEmailOrPhone(UserModel, email, phone) {
  const lookup = buildUserLookupQuery(email, phone);
  if (!lookup) return null;
  const doc = await UserModel.collection.findOne(lookup, { projection: { _id: 1 } });
  return doc?._id ?? null;
}

module.exports = { phoneVariants, buildUserLookupQuery, findUserIdByEmailOrPhone };
