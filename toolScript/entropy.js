// entropy.js MIT License © 2014 James Abney http://github.com/jabney

// Calculate the Shannon entropy of a string in bits per symbol.

  // Create a dictionary of character frequencies and iterate over it.
  function process(s, evaluator) {
    var h = Object.create(null), k;
    s.split('').forEach(function(c) {
      h[c] && h[c]++ || (h[c] = 1); });
    if (evaluator) for (k in h) evaluator(k, h[k]);
    return h;
  };
  
  // Measure the entropy of a string in bits per symbol.
  function entropy(s) {
    var sum = 0,len = s.length;
    process(s, function(k, f) {
      var p = f/len;
      sum -= p * Math.log(p) / Math.log(2);
    });
    console.log(sum)
    return sum;
  };
  
 
entropy('EtyDDDs');          // 1.8464393446710154
entropy('0');                   // 0
entropy('01');                  // 1
entropy('0123');                // 2
entropy('01234567');            // 3
entropy('0123456789abcdef');    // 4