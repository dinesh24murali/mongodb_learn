const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

const LocationSchema = new Schema({
    city: { type: Schema.Types.String },
    state: { type: Schema.Types.String },
    pop: { type: Schema.Types.Number, required: true },
    loc: { type: [Schema.Types.Number], required: true },
});

const MarkSchema = new Schema({
    rollNo: { type: Schema.Types.String, unique: true, required: true },
    name: { type: Schema.Types.String, required: true },
    aggregateMarks: { type: Schema.Types.Number, required: true },
});

const RankSchema = new Schema({
    rollNo: { type: Schema.Types.String, unique: true, required: true },
    rank: { type: Schema.Types.Number, required: true },
});

const Marks = mongoose.model('mark', MarkSchema);
const Ranks = mongoose.model('rank', RankSchema);

const Location = mongoose.model('location', LocationSchema);

module.exports = {
    Location,
    Marks,
    Ranks
}
