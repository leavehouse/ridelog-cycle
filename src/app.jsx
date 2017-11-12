import xs from 'xstream'

export function App (sources) {
  const actions = intent(sources.DOM);
  const state$ = model(actions);
  const vtree$ = view(state$);

  return {
    DOM: vtree$
  }
}

function intent(domSource) {
  const addRide$ = domSource.select('.add-ride').events('click')
    .map(() => {
      return {
        type: 'ride',
        timestamp: new Date().toLocaleString()
      }
    });

  const addPayment$ = domSource.select('.add-payment').events('click')
    .map(() => {
      const amount = window.prompt("Payment amount:");
      const parsed_amount = parseInt(amount, 10);
      if (isNaN(parsed_amount)) {
          window.alert("Submitted amount is not a valid integer.");
          return null;
      }
      return {
        type: 'payment',
        timestamp: new Date().toLocaleString(),
        amount: parsed_amount,
      }
    });

  return {
      addRide$: addRide$,
      addPayment$: addPayment$
  };
}

function model(actions) {
  const action$ = xs.merge(actions.addRide$, actions.addPayment$);
  return action$.fold((actions, a) => {
      if (a === null) {
          return actions;
      }
      if (a.type === 'ride') {
        actions.rides.push({timestamp: a.timestamp});
      } else if (a.type === 'payment') {
        actions.payments.push({timestamp: a.timestamp, amount: a.amount});
      }
      return actions;
    },
    { rides: [], payments: [] }
  );
}

function view(state$) {
  return state$.map(state => {
    const rides = state.rides.slice().reverse().map(r =>
      <li>
        <label>{r.timestamp}</label>
        <button className="delete-ride">×</button>
      </li>);

    const payments = state.payments.slice().reverse().map(p =>
      <li>
        <label>${p.amount} on {p.timestamp}</label>
        <button className="delete-payment">×</button>
      </li>);

    return (
      <div>
        <div className="controls">
          <button className="add-ride">Add Ride</button>
          <button className="add-payment">Add Payment</button>
        </div>
        <ul>{rides}</ul>
        <ul>{payments}</ul>
      </div>
    );
  });
}
