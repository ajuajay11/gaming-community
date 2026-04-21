/** Builds Mongo `$set` for partial listing updates from a normalized body. */
function buildListingUpdate(body) {
  const $set = {};
  if (body.title !== undefined) $set.title = body.title;
  if (body.description !== undefined) $set.description = body.description;
  if (body.gameName !== undefined) $set["game.name"] = body.gameName;
  if (body.gameCategory !== undefined) $set["game.category"] = body.gameCategory;
  if (body.priceAmount !== undefined) $set["price.amount"] = body.priceAmount;
  if (body.currency !== undefined) $set["price.currency"] = body.currency;
  if (body.negotiable !== undefined) $set["price.negotiable"] = body.negotiable;
  if (body.status !== undefined) $set.status = body.status;
  if (body.details !== undefined) $set.details = body.details;
  return $set;
}

module.exports = { buildListingUpdate };
