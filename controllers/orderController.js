const dataStore = require('../config/dataStore');

exports.placeOrder = async (req, res) => {
  const userId = req.user.id || req.user._id;
  const { items, subtotal, deliveryCharge, discount, total, paymentMethod, address } = req.body;

  try {
    if (!items || !items.length || subtotal === undefined || total === undefined || !paymentMethod || !address) {
      return res.status(400).json({ message: 'Missing order details' });
    }

    // Generate custom Order ID: ORD-xxxxxx
    const orderId = 'ORD-' + Math.floor(Math.random() * 900000 + 100000);

    const order = await dataStore.createOrder(userId, {
      orderId,
      items,
      subtotal,
      deliveryCharge: deliveryCharge || 0,
      discount: discount || 0,
      total,
      paymentMethod,
      address
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Place order error:', error);
    res.status(500).json({ message: 'Server error placing order' });
  }
};

exports.getUserOrders = async (req, res) => {
  const userId = req.user.id || req.user._id;
  try {
    const orders = await dataStore.getOrdersByUser(userId);
    res.json(orders);
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ message: 'Server error retrieving orders history' });
  }
};

exports.trackOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await dataStore.getOrderById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Simulate real-time tracking update:
    // We update tracking steps dynamically based on time passed since creation!
    // This is a super premium user experience!
    const elapsedMinutes = Math.floor((Date.now() - new Date(order.createdAt)) / 60000);
    
    let updatedSteps = [...order.trackingSteps];
    let changed = false;

    // After 2 minutes, order is confirmed (step 2 completed)
    if (elapsedMinutes >= 2 && !updatedSteps[1].completed) {
      updatedSteps[1].completed = true;
      updatedSteps[1].time = 'Just now';
      changed = true;
    }
    // After 5 minutes, processing (step 3 completed)
    if (elapsedMinutes >= 5 && !updatedSteps[2].completed) {
      updatedSteps[2].completed = true;
      updatedSteps[2].time = 'Just now';
      changed = true;
    }
    // After 10 minutes, shipped (step 4 completed)
    if (elapsedMinutes >= 10 && !updatedSteps[3].completed) {
      updatedSteps[3].completed = true;
      updatedSteps[3].time = 'Just now';
      changed = true;
    }

    if (changed) {
      order.trackingSteps = updatedSteps;
      if (typeof order.save === 'function') {
        await order.save();
      }
    }

    res.json({
      orderId: order.orderId,
      trackingSteps: order.trackingSteps,
      rider: order.rider
    });
  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({ message: 'Server error retrieving order tracking' });
  }
};
