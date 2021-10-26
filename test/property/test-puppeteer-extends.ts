import { testProp, fc } from 'ava-fast-check'

import { puppeteerExtends } from '../../src/index'

testProp.skip(
    'TODO: property-test puppeteer-extends',
    [
        // arbitraries
        fc.nat(),
    ],
    (
        t,
        // test arguments
        natural,
    ) => {
        // ava test here
    },
    {
        verbose: true,
    },
)
