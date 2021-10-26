import {testProp, fc} from 'ava-fast-check';

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
);
