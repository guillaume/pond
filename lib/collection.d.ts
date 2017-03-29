import * as Immutable from "immutable";
import EventKey from "./eventkey";
import Event from "./event";
import TimeRange from "./timerange";
/**
 * A Collection holds a ordered (but not sorted) map of Events.
 *
 * The Events stored in a Collection are mapped by their key
 * so a Collection can not hold more than one Event of the same
 * key, thus de-duplication is part of how a Collection works.
 * Later Events to be added supersede early ones. Internally, a
 * Collection holds its data in an Immutable.OrderedMap.
 *
 * In Typescript, you can give a Collection<T> a type T, which is
 * the Event type accepted into the Collection (e.g. Collection<Time>).
 */
declare class Collection<T extends EventKey> {
    protected _events: Immutable.OrderedMap<T, Event<T>>;
    constructor();
    constructor(arg1: Immutable.OrderedMap<T, Event<T>>);
    constructor(arg1: Collection<T>);
    /**
     * Returns the Collection as a regular JSON object. This
     * is implementation specific, in that different types of
     * Collections will likely implement this in their own way.
     *
     * In the case of our OrderedMap, this code simply called
     * internalOrderedMap.toJS() and lets Immutable.js do its
     * thing.
     *
     * @return {Object} The JSON representation of this Collection
     */
    toJSON(): any;
    /**
     * Serialize out the Collection as a string. This will be the
     * string representation of `toJSON()`.
     *
     * @return {string} The Collection serialized as a string.
     */
    toString(): string;
    /**
     * Adds a new Event into the Collection. Since a Collection only
     * represents a bag of Events with unique keys, the Event will
     * be deduped. You can optionally provide a callback that will
     * be called with the existing event in the case of an Event
     * already existing in the Collection. You can return from this
     * the Event to actually add. The default is to replace existing
     * Events with the new Event.
     *
     * @example
     * ```
     * collection = collection.addEvent(e2, e => {
     *     return new Event<Time>(
     *         timestamp1,
     *         { a: e2.get("a") + e.get("a") } // sum them
     *     );
     * });
     * ```
     * @param event The new Event of type T to be added into the Collection
     * @param dudup Callback function to reconcile an existing Event
     *
     * @returns Collection<T> The new Collection with the Event
     *                        added into it
     */
    addEvent(event: Event<T>, dedup?: (event: Event<T>) => Event<T>): Collection<T>;
    setEvents(events: Immutable.OrderedMap<T, Event<T>>): Collection<T>;
    /**
     * @returns The number of Events in this Collection
     */
    size(): number;
    /**
     * Returns the number of valid items in this `Collection`.
     *
     * Uses the `fieldPath` to look up values in all Events.
     * It then counts the number that are considered valid, which
     * specifically are not:
     *  * NaN
     *  * undefined
     *  * null.
     *
     * @param
     *
     * @return {number} Count of valid events
     */
    sizeValid(fieldPath?: string): number;
    /**
     * Returns the Event at the given position `pos` in the
     * Collection. Note that this probably the least efficient
     * way to fetch a point. If you wish to scan the whole set
     * of Events, use an iterator (see `forEach()` and `map()`).
     * For direct access the Collection is optimised for
     * returning results via key (see `atKey()`).
     *
     * @param pos The position of the Event to return
     */
    at(pos: number): Event<T>;
    /**
     * Returns the Event located at the key specified, if it
     * exists. Note that this doesn't find the closest key, or
     * implement bisect. For that you need the order maintained
     * Collection that is part of TimeSeries.
     *
     * @example
     * ```
     * const timestamp = new Time("2015-04-22T03:30:00Z");
     * const event = collection.atKey(timestamp)
     * ```
     * @param key The key of the Event
     */
    atKey(key: T): Event<T>;
    /**
     * Returns all the Events as an Immutable.List
     *
     * @returns Immutable.List<Event<t>> The list of Events in
     *                                   this Collection, converted to
     *                                   a List.
     */
    eventList(): Immutable.List<Event<T>>;
    /**
     * Returns the events in the Collection as a Immutable.Map, where
     * the key of the Event (e.g. timestamp, index, or TimeRange),
     * represented as a string, is mapped to the Event.
     *
     * @returns Immutable.Map<T, Event<T>> Events in this Collection,
     *                                     converted to a Map.
     */
    eventMap(): Immutable.Map<T, Event<T>>;
    /**
     * Returns an iterator into the internal event SortedMap.
     *
     * @example
     * ```
     * let iterator = this._events.entries();
     * for (let x = iterator.next(); !x.done; x = iterator.next()) {
     *     const [key, event] = x.value;
     *     console.log("Key:", +key, "Event:", event.toString());
     * }
     * ```
     * @returns Immutable.Iterator<any[]> Iterator
     */
    entries(): Immutable.Iterator<any[]>;
    /**
     * Iterate over the events in this Collection. Events are in the
     * order that they were added, unless the Collection has since been
     * sorted.
     *
     * If you return false from the sideEffect callback, the iteration
     * will end. The function returns the number of events iterated.
     *
     * @example
     * ```
     * collection.forEach((e, k) => {
     *     console.log(e, k);
     * })
     * ```
     */
    forEach(sideEffect: (value?: Event<T>, key?: T, iter?: Immutable.Iterable<T, Event<T>>) => any): number;
    /**
     * Map over the events in this Collection. For each Event
     * passed to your callback function you should map that to
     * a new Event.
     *
     * @example
     * ```
     * const mapped = sorted.map(event => {
     *     return new Event(event.key(), { a: 55 });
     * });
     * ```
     */
    map(mapper: (event?: Event<T>, key?: T) => void): Collection<T>;
    /**
     * Sorts the `Collection` by the `Event` key `T`.
     *
     * In the case case of the key being `Time`, this is clear.
     * For `TimeRangeEvents` and `IndexedEvents`, the `Collection`
     * will be sorted by the begin time.
     *
     * This method is particularly useful when the `Collection`
     * will be passed into a `TimeSeries`.
     *
     * See also `Collection.isChronological()`.
     *
     * @example
     * ```
     * const sorted = collection.sortByTime();
     * ```
     * @returns Collection<T> A new collection, sorted by the
     *                        Event key of type T
     */
    sortByTime(): Collection<T>;
    /**
     * Sorts the Collection using the value referenced by
     * the `field`.
     */
    sort(field: string): Collection<T>;
    /**
     * Returns the extents of the Collection as a TimeRange.
     * Since this Collection is not necessarily in order, this
     * method will traverse the Collection and determine the
     * ealiest and latest time represented within it.
     */
    timerange(): TimeRange;
}
export default Collection;