const vals = new WeakMap();
const taps = new WeakMap();
const plugs = new WeakMap();
const T = (v) => {
    const t = function (...a) {
        if (!a.length) { return vals.get(t); }
        const x = a[0];
        vals.set(t, x);
        taps.get(t).forEach((l) => l(x));
        return t;
    };
    const fin = () => {};
    taps.set(t, new Set());
    plugs.set(t, new Set());
    vals.set(t, v);
    return Object.assign(t, {
        tap(f) {
            taps.get(t).add(f);
            const u = () => {
                taps.get(t).delete(f);
                plugs.get(t).delete(u);
            };
            plugs.get(t).add(u);
            return u;
        },
        plug() {
            [...plugs.get(t)].forEach((u) => {
                u();
                plugs.get(t).delete(u);
            });
            [...taps.get(t)].forEach((f) => taps.get(t).delete(f));
            fin();
        },
        map(f) {
            const o = T(t());
            const u = t.tap((x) => o(f(x)));
            plugs.get(o).add(u);
            return o;
        },
        filter(f) {
            const o = T(t());
            const u = t.tap((x) => f(x) && o(x));
            plugs.get(o).add(u);
            return o;
        },
        merge(...z) {
            const o = T();
            const u = t.tap(o);
            z.forEach((y) => {
                const x = y.tap(o);
                plugs.get(o).add(x);
            });
            plugs.get(o).add(u);
            return o;
        },
        take(n) {
            let m = n;
            const o = T(t());
            const u = t.tap((x) => {
                o(x);
                if (--m) { return; }
                u();
                o.plug();
            });
            plugs.get(o).add(u);
            return o;
        },
        skip(n) {
            let m = 0;
            const o = T(t());
            const u = t.tap((x) => {
                if (m++ < n) { return; }
                o(x);
            });
            plugs.get(o).add(u);
            return o;
        },
        until(z) {
            const o = T(t());
            const u = t.tap(o);
            const r = z.tap(o.plug);
            plugs.get(o).add(u);
            plugs.get(o).add(r);
            return o;
        },
        since(z) {
            const o = T(t());
            const u = z.tap(() => {
                const y = t.tap(o);
                plugs.get(o).add(y);
                u();
            });
            plugs.get(o).add(u);
            return o;
        },
        debounce(m) {
            const o = T(t());
            let z;
            const u = t.tap(() => {
                clearTimeout(z);
                z = setTimeout(() => o(t()), m);
            });
            plugs.get(o).add(u);
            return o;
        },
        flatMap(f) {
            const o = T();
            const u = t.tap((x) => {
                const z = f(x);
                const y = z.tap(o);
                plugs.get(o).add(y);
            });
            plugs.get(o).add(u);
            return o;
        }
    });
};
T.vals = vals;
T.taps = taps;
T.plugs = plugs;
return T;

// var click = Tube();
// var mousedown = Tube();
// var mouseup = Tube();
// var mousemove = Tube();
// var mouseout = Tube();
// document.body.addEventListener('click', click);
// document.body.addEventListener('mousedown', mousedown);
// document.body.addEventListener('mousemove', mousemove);
// document.body.addEventListener('mouseup', mouseup);
// document.body.addEventListener('mouseout', mouseout);
// var plugs = [
//     click.tap(console.log.bind(console, 'click')),
//     mousedown.tap(console.log.bind(console, 'mousedown')),
//     mouseup.tap(console.log.bind(console, 'mouseup')),
//     mousemove.take(2).tap(console.log.bind(console, 'mousemove')),
//     mouseout.tap(console.log.bind(console, 'mouseout')),
//     click.take(2).tap(console.log.bind(console, 'take(2)')),
//     click.skip(2).tap(console.log.bind(console, 'skip(2)')),
//     mousedown.flatMap((md) => {
//         console.log('dragstart', md);
//         const {clientX, clientY} = md;
//         return mousemove.map((mm) => {
//             return {x: mm.clientX - clientX, y: mm.clientY - clientY};
//         }).until(mouseup);
//     }).tap(console.log.bind(console, 'flatMap')),
//     click.skip(5).tap(() => plugs.map((f) => f()) && console.log('fin'))
// ];
