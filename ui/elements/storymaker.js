module.exports = (document) => {
    const $storymaker = document.createElement('main');
    document.title = 'storymaker';
    $storymaker.appendChild(require('./menu')(document));
    return $storymaker;
};
