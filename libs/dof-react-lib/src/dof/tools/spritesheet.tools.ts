// attach the output of this to html or body.
export function getArtistCreditStyles(config: { [key: string]: { color: string } }) {
    return Object.keys(config).reduce((items, key) => ({ ...items, [`--lb-artist-${key}`]: config[key].color }), {})
}