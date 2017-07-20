module.exports = (document) => {
    const $header = document.createElement('header');
    const $nav = document.createElement('nav');
    $header.appendChild($nav);
    return $header;
};
