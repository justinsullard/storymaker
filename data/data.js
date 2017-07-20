const UUID = require('lib/uuid');

const Thing = (type, thing) => Object.extend(thing, {
    '@context': '/',
    '@type': type,
    '@id': UUID()
});

const Person = () => Thing('Person', {
    email: null,
    telephone: null
});

const Session = () => Thing('Session', {
    person: null // @Person
});

const Story = () => Thing('Story' {
    editor: [], // @Person
    character: [], // @Character
    hasPart: [], // @Plot
    author: null, // @Person
    name: null,
    headline: null,
    description: null,
    text
});

const Character = () => Thing('Character', 'Person', {
    isPartOf: [], // @Story
    performerIn: [], // @Scene
    knows: null, // @Person
    name: null,
    description: null
});

const Invitation = () => Thing('Invitation', 'CommunicateAction', {
    recipient: null, // @Person
    about: null, // @Character || @Story
    actionStatus: { '@type': 'ActiveActionStatus'}
});

const Place = () => Thing('Place', 'Place', {
    name: null,
    containerInPlace: null,
    containsPlace: [],
    event: [] // @Scene
});

const Plot = () => Thing('Plot', 'CreativeWork', {
    isPartOf: null, // @Story
    hasPart: [], // @Scene
    name: null,
    headline: null,
    description: null,
    text
});

const Scene = () => Thing('Scene', 'CreativeWork', {
    editor: [], // @Person
    isPartOf: [], // @Plot
    locationCreated: null, // @Place
    temporalCoverage: null
});
const Script = () => Thing('Script', 'CreativeWork', {
    isPartOf: [], // @Scene
    character: null // @Character
});
const Roll = () => Thing('Roll', 'CreativeWork', {
    isPartOf: [], // @Story,
    character: null
});
const Place = () => Thing('Place', 'CreativeWork', {
    isPartOf: []
});
// WriteAction
const Narration = () => Thing('Narration', 'CreativeWork', {
    isPartOf: []
});
const Dialog = () => Thing('Dialog', 'CreativeWork', {
    isPartOf: []
});
const Thought = () => Thing('Thought', 'CreativeWork', {
    isPartOf: []
});
const Journal = () => Thing('Journal', 'CreativeWork', {
    isPartOf: []
});

// Map
// Timeline

module.exports = {
    Session,
    Person,
    Story,
    Character,
    Invitation,
    Place,
    Plot,
    Scene,
    Script,
    Roll,
    Narration,
    Dialog,
    Thought,
    Journal
};

