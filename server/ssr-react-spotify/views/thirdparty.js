//from https://github.com/loverajoel/spotify-sdk/blob/master/src/entities/TrackEntity.js
export class TrackEntity {
  /**
   * Constructor
   *
   * @param {Object} data Track object
   */
  constructor(data = {}) {
    this._album = data.album;
    this._artists = data.artists;
    this._available_markets = data.available_markets;
    this._disc_number = data.disc_number;
    this._duration_ms = data.duration_ms;
    this._explicit = data.explicit;
    this._external_ids = data.external_ids;
    this._external_urls = data.external_urls;
    this._href = data.href;
    this._id = data.id;
    // this._is_playable = data.is_playable; @relinking
    // this._linked_from = data.linked_from; @relinking
    this._name = data.name;
    this._popularity = data.popularity;
    this._preview_url = data.preview_url;
    this._track_number = data.track_number;
    this._type = "track";
    this._uri = data.uri;
  }

  /**
   * @param {Object} data Track object
   */
  set album(data) {
    this._album = data;
  }

  /**
   * @return {String} Track album
   */
  get album() {
    return this._album;
  }

  /**
   * @param {Object} data Track object
   */
  set artists(data) {
    this._artists = data;
  }

  /**
   * @return {String} Track artists
   */
  get artists() {
    return this._artists;
  }

  /**
   * @param {Object} data Track object
   */
  set available_markets(data) {
    this._available_markets = data;
  }

  /**
   * @return {String} Track available_markets
   */
  get available_markets() {
    return this._available_markets;
  }

  /**
   * @param {Object} data Track object
   */
  set disc_number(data) {
    this._disc_number = data;
  }

  /**
   * @return {String} Track disc_number
   */
  get disc_number() {
    return this._disc_number;
  }

  /**
   * @param {Object} data Track object
   */
  set duration_ms(data) {
    this._duration_ms = data;
  }

  /**
   * @return {String} Track duration_ms
   */
  get duration_ms() {
    return this._duration_ms;
  }

  /**
   * @param {Object} data Track object
   */
  set explicit(data) {
    this._explicit = data;
  }

  /**
   * @return {String} Track explicit
   */
  get explicit() {
    return this._explicit;
  }

  /**
   * @param {Object} data Track object
   */
  set external_ids(data) {
    this._external_ids = data;
  }

  /**
   * @return {String} Track external_ids
   */
  get external_ids() {
    return this._external_ids;
  }

  /**
   * @param {Object} data Track object
   */
  set external_urls(data) {
    this._external_urls = data;
  }

  /**
   * @return {String} Track external_urls
   */
  get external_urls() {
    return this._external_urls;
  }

  /**
   * @param {Object} data Track object
   */
  set href(data) {
    this._href = data;
  }

  /**
   * @return {String} Track href
   */
  get href() {
    return this._href;
  }

  /**
   * @param {Object} data Track object
   */
  set id(data) {
    this._id = data;
  }

  /**
   * @return {String} Track id
   */
  get id() {
    return this._id;
  }

  /**
   * @param {Object} data Track object
   */
  set is_playable(data) {
    this._is_playable = data;
  }

  /**
   * @return {String} Track is_playable
   */
  get is_playable() {
    return this._is_playable;
  }

  /**
   * @param {Object} data Track object
   */
  set linked_from(data) {
    this._linked_from = data;
  }

  /**
   * @return {String} Track linked_from
   */
  get linked_from() {
    return this._linked_from;
  }

  /**
   * @param {Object} data Track object
   */
  set name(data) {
    this._name = data;
  }

  /**
   * @return {String} Track name
   */
  get name() {
    return this._name;
  }

  /**
   * @param {Object} data Track object
   */
  set popularity(data) {
    this._popularity = data;
  }

  /**
   * @return {String} Track popularity
   */
  get popularity() {
    return this._popularity;
  }

  /**
   * @param {Object} data Track object
   */
  set preview_url(data) {
    this._preview_url = data;
  }

  /**
   * @return {String} Track preview_url
   */
  get preview_url() {
    return this._preview_url;
  }

  /**
   * @param {Object} data Track object
   */
  set track_number(data) {
    this._track_number = data;
  }

  /**
   * @return {String} Track track_number
   */
  get track_number() {
    return this._track_number;
  }

  /**
   * @param {Object} data Track object
   */
  set type(data) {
    this._type = data;
  }

  /**
   * @return {String} Track type
   */
  get type() {
    return this._type;
  }

  /**
   * @param {Object} data Track object
   */
  set uri(data) {
    this._uri = data;
  }

  /**
   * @return {String} Track uri
   */
  get uri() {
    return this._uri;
  }
}

/**
 * Properties and methods of the User Entity
 *
 * @see https://developer.spotify.com/web-api/object-model/#user-object-private
 */
// from https://raw.githubusercontent.com/loverajoel/spotify-sdk/master/src/entities/UserEntity.js
export class UserEntity {
  /**
   * Constructor
   *
   * @param {Object} data User object
   */
  constructor(data = {}) {
    this._id = data.id;
    this._birthdate = data.birthdate;
    this._country = data.country;
    this._display_name = data.display_name;
    this._email = data.email;
    this._external_urls = data.external_urls;
    this._followers = data.followers;
    this._href = data.href;
    this._images = data.images;
    this._product = data.product;
    this._type = "user";
    this._uri = data.uri;
  }

  /**
   * @return {String} User birthdate
   */
  get birthdate() {
    return this._birthdate;
  }

  /**
   * @param {Object} data User object
   */
  set birthdate(data) {
    this._birthdate = data;
  }

  /**
   * @return {String} User country
   */
  get country() {
    return this._country;
  }

  /**
   * @param {Object} data User object
   */
  set country(data) {
    this._country = data;
  }

  /**
   * @return {String} User display_email
   */
  get display_email() {
    return this._display_email;
  }

  /**
   * @param {Object} data User object
   */
  set display_email(data) {
    this._display_email = data;
  }

  /**
   * @return {String} User name
   */
  get name() {
    return this._name;
  }

  /**
   * @param {Object} data User object
   */
  set name(data) {
    this._name = data;
  }

  /**
   * @return {String} User external_urls
   */
  get external_urls() {
    return this._external_urls;
  }

  /**
   * @param {Object} data User object
   */
  set external_urls(data) {
    this._external_urls = data;
  }

  /**
   * @return {String} User followers
   */
  get followers() {
    return this._followers;
  }

  /**
   * @param {Object} data User object
   */
  set followers(data) {
    this._followers = data;
  }

  /**
   * @return {String} User href
   */
  get href() {
    return this._href;
  }

  /**
   * @param {Object} data User object
   */
  set href(data) {
    this._href = data;
  }

  /**
   * @return {String} User images
   */
  get images() {
    return this._images;
  }

  /**
   * @param {Object} data User object
   */
  set images(data) {
    this._images = data;
  }

  /**
   * @return {String} User product
   */
  get product() {
    return this._product;
  }

  /**
   * @param {Object} data User object
   */
  set product(data) {
    this._product = data;
  }

  /**
   * @return {String} Entity type
   */
  get type() {
    return this._type;
  }

  /**
   * @return {String} User uri
   */
  get uri() {
    return this._uri;
  }

  /**
   * @param {Object} data User object
   */
  set uri(data) {
    this._uri = data;
  }

  /**
   * @return {User} Track id
   */
  get id() {
    return this._id;
  }

  /**
   * @param {Object} data User object
   */
  set id(data) {
    this._id = data;
  }
}

export class AlbumEntity {
  /**
   * Constructor
   *
   * @param {Object} data Album object
   */
  constructor(data = {}) {
    this._album_type = data.album_type;
    this._artists = data.artists;
    this._available_markets = data.available_markets;
    this._copyrights = data.copyrights;
    this._external_ids = data.external_ids;
    this._external_urls = data.external_urls;
    this._genres = data.genres;
    this._href = data.href;
    this._id = data.id;
    this._images = data.images;
    this._name = data.name;
    this._popularity = data.popularity;
    this._release_date = data.release_date;
    this._release_date_precision = data.release_date_precision;
    this._tracks = data.tracks;
    this._type = data.type;
    this._uri = data.uri;
  }

  /**
   * @param {Object} data Album object
   */
  set album_type(data) {
    this._album_type = data.album_type;
  }

  /**
   * @return {String} Album type
   */
  get album_type() {
    return this._album_type;
  }

  /**
   * @param {Object} data Album object
   */
  set artists(data) {
    this._artists = data.artists;
  }

  /**
   * @return {String} Album artists
   */
  get artists() {
    return this._artists;
  }

  /**
   * @param {Object} data Album object
   */
  set available_markets(data) {
    this._available_markets = data.available_markets;
  }

  /**
   * @return {String} Album available_markets
   */
  get available_markets() {
    return this._available_markets;
  }

  /**
   * @param {Object} data Album object
   */
  set copyrights(data) {
    this._copyrights = data.copyrights;
  }

  /**
   * @return {String} Album copyrights
   */
  get copyrights() {
    return this._copyrights;
  }

  /**
   * @param {Object} data Album object
   */
  set external_ids(data) {
    this._external_ids = data.external_ids;
  }

  /**
   * @return {String} Album external_ids
   */
  get external_ids() {
    return this._external_ids;
  }

  /**
   * @param {Object} data Album object
   */
  set external_urls(data) {
    this._external_urls = data.external_urls;
  }

  /**
   * @return {String} Album external_urls
   */
  get external_urls() {
    return this._external_urls;
  }

  /**
   * @param {Object} data Album object
   */
  set genres(data) {
    this._genres = data.genres;
  }

  /**
   * @return {String} Album genres
   */
  get genres() {
    return this._genres;
  }

  /**
   * @param {Object} data Album object
   */
  set href(data) {
    this._href = data.href;
  }

  /**
   * @return {String} Album href
   */
  get href() {
    return this._href;
  }

  /**
   * @param {Object} data Album object
   */
  set id(data) {
    this._id = data.id;
  }

  /**
   * @return {String} Album id
   */
  get id() {
    return this._id;
  }

  /**
   * @param {Object} data Album object
   */
  set images(data) {
    this._images = data.images;
  }

  /**
   * @return {String} Album images
   */
  get images() {
    return this._images;
  }

  /**
   * @param {Object} data Album object
   */
  set name(data) {
    this._name = data.name;
  }

  /**
   * @return {String} Album name
   */
  get name() {
    return this._name;
  }

  /**
   * @param {Object} data Album object
   */
  set popularity(data) {
    this._popularity = data.popularity;
  }

  /**
   * @return {String} Album popularity
   */
  get popularity() {
    return this._popularity;
  }

  /**
   * @param {Object} data Album object
   */
  set release_date(data) {
    this._release_date = data.release_date;
  }

  /**
   * @return {String} Album release_date
   */
  get release_date() {
    return this._release_date;
  }

  /**
   * @param {Object} data Album object
   */
  set release_date_precision(data) {
    this._release_date_precision = data.release_date_precision;
  }

  /**
   * @return {String} Album release_date_precision
   */
  get release_date_precision() {
    return this._release_date_precision;
  }

  /**
   * @param {Object} data Album object
   */
  set tracks(data) {
    this._tracks = data.tracks;
  }

  /**
   * @return {String} Album tracks
   */
  get tracks() {
    return this._tracks;
  }

  /**
   * @param {Object} data Album object
   */
  set type(data) {
    this._type = data.type;
  }

  /**
   * @return {String} Entity type
   */
  get type() {
    return this._type;
  }

  /**
   * @param {Object} data Album object
   */
  set uri(data) {
    this._uri = data.uri;
  }

  /**
   * @return {String} Album uri
   */
  get uri() {
    return this._uri;
  }
}

/**
 * Properties and methods of the Artist Entity
 *
 * @see https://developer.spotify.com/web-api/object-model/#album-object-full
 */
export class ArtistEntity {
  /**
   * Constructor
   *
   * @param {Object} data Artist object
   */
  constructor(data = {}) {
    this._external_urls = data.external_urls;
    this._followers = data.followers;
    this._genres = data.genres;
    this._href = data.href;
    this._id = data.id;
    this._images = data.images;
    this._name = data.name;
    this._popularity = data.popularity;
    this._type = data.type;
    this._uri = data.uri;
  }

  /**
   * @param {Object} data Artist object
   */
  set external_urls(data) {
    this._external_urls = data;
  }

  /**
   * @return {String} Artist external_urls
   */
  get external_urls() {
    return this._external_urls;
  }

  /**
   * @param {Object} data Artist object
   */
  set followers(data) {
    this._followers = data;
  }

  /**
   * @return {String} Artist followers
   */
  get followers() {
    return this._followers;
  }

  /**
   * @param {Object} data Artist object
   */
  set genres(data) {
    this._genres = data;
  }

  /**
   * @return {String} Artist genres
   */
  get genres() {
    return this._genres;
  }

  /**
   * @param {Object} data Artist object
   */
  set href(data) {
    this._href = data;
  }

  /**
   * @return {String} Artist href
   */
  get href() {
    return this._href;
  }

  /**
   * @param {Object} data Artist object
   */
  set id(data) {
    this._id = data;
  }

  /**
   * @return {String} Artist id
   */
  get id() {
    return this._id;
  }

  /**
   * @param {Object} data Artist object
   */
  set images(data) {
    this._images = data;
  }

  /**
   * @return {String} Artist images
   */
  get images() {
    return this._images;
  }

  /**
   * @param {Object} data Artist object
   */
  set name(data) {
    this._name = data;
  }

  /**
   * @return {String} Artist name
   */
  get name() {
    return this._name;
  }

  /**
   * @param {Object} data Artist object
   */
  set popularity(data) {
    this._popularity = data;
  }

  /**
   * @return {String} Artist popularity
   */
  get popularity() {
    return this._popularity;
  }

  /**
   * @param {Object} data Artist object
   */
  set type(data) {
    this._type = data;
  }

  /**
   * @return {String} Entity type
   */
  get type() {
    return this._type;
  }

  /**
   * @param {Object} data Artist object
   */
  set uri(data) {
    this._uri = data;
  }

  /**
   * @return {String} Artist uri
   */
  get uri() {
    return this._uri;
  }
}

/**
 * Properties and methods of the Playlist Entity
 *
 * @see https://developer.spotify.com/web-api/object-model/#playlist-object-full
 */
export class PlaylistEntity {
  /**
   * Constructor
   *
   * @param {Object} data Playlist object
   */
  constructor(data = {}) {
    this._collaborative = data.collaborative;
    this._description = data.description;
    this._external_urls = data.external_urls;
    this._followers = data.followers;
    this._href = data.href;
    this._id = data.id;
    this._images = data.images;
    this._name = data.name;
    this._owner = data.owner;
    this._public = data.public;
    this._snapshot_id = data.snapshot_id;
    this._tracks = data.tracks;
    this._type = data.type;
    this._uri = data.uri;
  }

  /**
   * @param {Object} data Playlist object
   */
  set collaborative(data) {
    this._collaborative = data;
  }

  /**
   * @return {String} Playlist collaborative
   */
  get collaborative() {
    return this._collaborative;
  }

  /**
   * @param {Object} data Playlist object
   */
  set description(data) {
    this._description = data;
  }

  /**
   * @return {String} Playlist description
   */
  get description() {
    return this._description;
  }

  /**
   * @param {Object} data Playlist object
   */
  set external_urls(data) {
    this._external_urls = data;
  }

  /**
   * @return {String} Playlist external_urls
   */
  get external_urls() {
    return this._external_urls;
  }

  /**
   * @param {Object} data Playlist object
   */
  set followers(data) {
    this._followers = data;
  }

  /**
   * @return {String} Playlist followers
   */
  get followers() {
    return this._followers;
  }

  /**
   * @param {Object} data Playlist object
   */
  set href(data) {
    this._href = data;
  }

  /**
   * @return {String} Playlist href
   */
  get href() {
    return this._href;
  }

  /**
   * @param {Object} data Playlist object
   */
  set id(data) {
    this._id = data;
  }

  /**
   * @return {Playlist} Album id
   */
  get id() {
    return this._id;
  }

  /**
   * @param {Object} data Playlist object
   */
  set images(data) {
    this._images = data;
  }

  /**
   * @return {String} Playlist images
   */
  get images() {
    return this._images;
  }

  /**
   * @param {Object} data Playlist object
   */
  set name(data) {
    this._name = data;
  }

  /**
   * @return {String} Playlist name
   */
  get name() {
    return this._name;
  }

  /**
   * @param {Object} data Playlist object
   */
  set owner(data) {
    this._owner = data;
  }

  /**
   * @return {String} Playlist owner
   */
  get owner() {
    return this._owner;
  }

  /**
   * @param {Object} data Playlist object
   */
  set public(data) {
    this._public = data;
  }

  /**
   * @return {String} Playlist public
   */
  get public() {
    return this._public;
  }

  /**
   * @param {Object} data Playlist object
   */
  set snapshot_id(data) {
    this._snapshot_id = data;
  }

  /**
   * @return {String} Playlist snapshot_id
   */
  get snapshot_id() {
    return this._snapshot_id;
  }

  /**
   * @param {Object} data Playlist object
   */
  set tracks(data) {
    this._tracks = data;
  }

  /**
   * @return {String} Playlist tracks
   */
  get tracks() {
    return this._tracks;
  }

  /**
   * @param {Object} data Playlist object
   */
  set type(data) {
    this._type = data;
  }

  /**
   * @return {String} Entity type
   */
  get type() {
    return this._type;
  }

  /**
   * @param {Object} data Playlist object
   */
  set uri(data) {
    this._uri = data;
  }

  /**
   * @return {Playlist} Album uri
   */
  get uri() {
    return this._uri;
  }
}

/**
 * Exports the AlbumEntity class.
 */
export default PlaylistEntity;
