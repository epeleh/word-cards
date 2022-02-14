import { shallowMount } from '@vue/test-utils';
import CardRemoveModal from '@/components/CardRemoveModal.vue';

describe('CardRemoveModal.vue', () => {
  let wrapper;

  describe('when api responds with 404 status', () => {
    beforeEach(async () => {
      global.fetch = jest.fn(() => Promise.resolve({ ok: false, status: 404 }));

      wrapper = shallowMount(CardRemoveModal, {
        global: { provide: { backendUrl: '' } },
        props: {
          cardId: 523,
          closeModal: global.closeModal = jest.fn(),
          deleteCard: global.deleteCard = jest.fn(),
        },
      });
    });

    it('renders', () => {
      expect(wrapper.exists()).toBe(true);
    });

    it('fetches a card by the correct id', () => {
      expect(global.fetch.mock.calls.length).toBe(1);
      expect(global.fetch).toHaveBeenCalledWith('/api/cards/523');
    });

    it('displays "no-card-banner" with the correct text', () => {
      expect(wrapper.find('h2.no-card-banner').text()).toBe('The card was not found :(');
    });
  });

  describe('when api responds with a card', () => {
    beforeEach(async () => {
      global.fetch = jest.fn(() => Promise.resolve({
        ok: true,
        json: () => ({
          id: 42,
          text: 'some text',
          translation: 'some translation',
          image_path: null,
          met_at: '2022-02-12 09:00:13 UTC',
          remembered: true,
          active: true,
          created_at: '2022-02-11 14:58:09 UTC',
          updated_at: '2022-02-12 09:00:13 UTC',
        }),
      }));

      wrapper = shallowMount(CardRemoveModal, {
        global: { provide: { backendUrl: '' } },
        props: {
          cardId: 42,
          closeModal: global.closeModal = jest.fn(),
          deleteCard: global.deleteCard = jest.fn(),
        },
      });
    });

    it('renders', () => {
      expect(wrapper.exists()).toBe(true);
    });

    it('fetches a card by the correct id', () => {
      expect(global.fetch.mock.calls.length).toBe(1);
      expect(global.fetch).toHaveBeenCalledWith('/api/cards/42');
    });

    it('displays the correct card id', () => {
      expect(wrapper.find('div.card-remove.remembered h4').text()).toBe('#42');
      expect(wrapper.find('div.card-remove.remembered h4').attributes()).toEqual({ title: '#42' });
    });

    it('displays the correct message', () => {
      expect(wrapper.find('div.card-remove.remembered p.message').text()).toBe(
        'Are you sure want to delete the card?',
      );
    });

    it('displays the no button', () => {
      expect(wrapper.find('div.card-remove.remembered button.btn.no-btn').text()).toBe('No');
      expect(global.closeModal.mock.calls.length).toBe(0);

      wrapper.find('div.card-remove.remembered button.btn.no-btn').trigger('click');
      expect(global.closeModal.mock.calls.length).toBe(1);
      expect(global.closeModal).toHaveBeenCalledWith();
    });

    it('displays the yes button', () => {
      expect(wrapper.find('div.card-remove.remembered button.btn.yes-btn').text()).toBe('Yes');
      expect(global.deleteCard.mock.calls.length).toBe(0);

      wrapper.find('div.card-remove.remembered button.btn.yes-btn').trigger('click');
      expect(global.deleteCard.mock.calls.length).toBe(1);
      expect(global.deleteCard).toHaveBeenCalledWith(42);
    });
  });
});
